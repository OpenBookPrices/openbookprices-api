"use strict";

var _       = require("underscore"),
    async   = require("async"),
    client  = require("./redis-client"),
    fetcher = require("openbookprices-fetchers"),
    config  = require("config"),
    exchange = require("../src/exchange");



function bookDetailsCacheKey (isbn) {
  return "bookDetails-" + isbn;
}

function getBookDetails (isbn, cb) {

  var cacheKey = bookDetailsCacheKey(isbn);

  client.get(cacheKey, function (err, reply) {
    if ( reply ) {
      cb( null, JSON.parse(reply) );
    } else {
      fetchFromScrapers(
        {vendor: "foyles", isbn: isbn, country: "GB", currency: "GBP"},
        function (err, results) {
          if (err) { return cb(err); }
          var bookDetails = extractBookDetails(results);
          cb(null, bookDetails);
        }
      );
    }
  });

}

function extractBookDetails (results) {
  var data = {
    isbn:    results.args.isbn,
    authors: results.authors,
    title:   results.title,
  };
  return data;
}


function cacheBookDetails (data) {
  var isbn = data.args.isbn;
  var cacheKey = bookDetailsCacheKey(isbn);

  client.exists(cacheKey, function (err, exists) {
    if (err) {
      console.warn(err);
    }
    if (!err && !exists) {
      var bookDetails = extractBookDetails(data);
      client.set(
        cacheKey,
        JSON.stringify(bookDetails),
        function (err) {
          if (err) {
            console.warn(err);
          }
        }
      );
    }
  });

}


function fetchFromScrapers (options, cb) {
  fetcher.fetch(
    options,
    function (err, data) {
      if (err) {
        return cb(err);
      }
      cacheBookDetails(data);
      // cacheBookPrices(data);
      cb(null, data);
    }
  );
}


function getBookPrices (args, done) {

  var vendors = fetcher.vendorsForCountry(args.country);

  async.map(
    vendors,
    function (vendor, cb) {
      getBookPricesForVendor(
        _.extend({vendor: vendor, fromCacheOnly: true}, args),
        cb
      );
    },
    done
  );

}


function getBookPricesForVendor (args, cb) {

  // Check if the vendor supports the currency we are asking for.
  var scrapeArgs = _.clone(args);
  scrapeArgs.currency = fetcher.currencyForVendor(args.vendor, args.currency);

  // Wrap the callback so that we can tidy up the response
  cb = _.wrap(cb, function (func, err, rawResult) {

    if (err) {
      // something went wrong with the scraper. Store an error in cache to back
      // off for a little while.
      // console.log(args, err);
      rawResult = createErrorResponse(args);

      // This is hacky, but because of the error the caching did not happen earlier.
      // The flow of this port of the process needs to be looked at to see if it could
      // be made clearer.
      cacheBookPrices([rawResult]);
    }

    // Let us alter the top level attributes without affecting that which is
    // being stored in the cache.
    var result = _.clone(rawResult);

    if (!result.status) {
      if ( result.timestamp ) {
        result.status = Date.now()/1000 < result.timestamp + result.ttl ? "ok" : "stale";
      } else {
        result.status = args.fromCacheOnly ? "unfetched" : "pending";
        result.timestamp = Math.floor(Date.now() / 1000);
      }
    }

    switch (result.status) {
    case "unfetched":
      result.retryDelay = config.retryDelayForUnfetched;
      break;
    case "pending":
      result.retryDelay = config.retryDelayForPending;
      break;
    case "stale":
      result.retryDelay = config.retryDelayForStale;
      break;
    default:
      result.retryDelay = null;
    }

    // convert the price if needed
    result = convertCurrencyInBookPrices(result, args.currency);

    // add the vendor specific endpoint
    result = addVendorPriceEndPointUrl(result);

    // Expand vendor into fuller details
    result = expandVendorDetails(result);

    func(null, result);
  });

  var cacheKey = bookPricesCacheKey(scrapeArgs);

  client.get(cacheKey, function (err, reply) {
    if ( reply ) {
      return cb( null, JSON.parse(reply) );
    } else if (args.fromCacheOnly) {

      var emptyResponse = _.omit(args, "fromCacheOnly");
      emptyResponse.ttl = 0;
      emptyResponse.timestamp = null;
      emptyResponse.url = null;
      return cb( null, emptyResponse);

    } else {
      fetchFromScrapers(
        scrapeArgs,
        function (err, results) {
          if (err) { return cb(err); }
          var bookPrices = extractBookPrices(results);
          cacheBookPrices(bookPrices);
          return cb(null, bookPrices[scrapeArgs.country]);
        }
      );
    }
  });
}


function convertCurrencyInBookPrices (result, currency) {
  var from = result.preConversionCurrency = result.currency;
  var to = result.currency = currency;

  if (from == to) {
    result.preConversionCurrency = null;
    return result;
  }

  _.each( result.offers, function (entry) {
    entry.price    = exchange.convert(entry.price, from, to);
    entry.shipping = exchange.convert(entry.shipping, from, to);

    // Add together to get total, rather than convert, to avoid odd instances
    // where price + shipping != total due to rounding errors
    entry.total = exchange.round( to, entry.price + entry.shipping );
  });


  return result;
}


function addVendorPriceEndPointUrl (entry) {
  var base = config.api.protocol + "://" + config.api.hostport;

  var path= [
    "",
    "v1",
    "books",
    entry.isbn,
    "prices",
    entry.country,
    entry.currency,
    entry.vendor
  ].join("/");
  entry.apiURL =  base + path;
  return entry;
}


function expandVendorDetails (entry) {
  // expand vendor into fuller details
  var vendorDetails = fetcher.vendorDetails(entry.vendor);
  entry.vendor = vendorDetails;
  return entry;
}


function extractBookPrices (results) {
  var pricesByCountry = {};

  _.each(results.entries, function (entry) {
    _.each( entry.countries, function (country) {

      var countryPrice = _.chain(entry)
        .omit("countries")
        .defaults({country: country})
        .value();

      pricesByCountry[country] = countryPrice;

    });
  });

  return pricesByCountry;
}


function bookPricesCacheKey (opt) {
  return ["bookPrice", opt.isbn, opt.country, opt.currency, opt.vendor].join("-");
}

function cacheBookPrices (bookPrices) {

  _.each(bookPrices, function (entry) {
    var cacheKey = bookPricesCacheKey(entry);

    var ttl = Math.floor(entry.timestamp + entry.ttl - Date.now()/1000);

    client.setex(
      cacheKey,
      ttl,
      JSON.stringify(entry)
    );
  });
}


function doesVendorServeCountry (vendor, country) {
  var vendorCountries = fetcher.vendorsForCountry(country);
  return _.contains(vendorCountries, vendor);
}

function isVendorCodeKnown (vendor) {
  var vendorCodes = fetcher.allVendorCodes();
  return _.contains(vendorCodes, vendor);
}


function createPendingResponse (args) {
  var response = _.extend(
    {
      status: "pending",
      preConversionCurrency: null,
      offers: {},
      url: null,
      retryDelay: config.retryDelayForPending,
      timestamp: Math.floor(Date.now()/1000),
      ttl: 0,
    },
    args
  );

  response = addVendorPriceEndPointUrl(response);
  response = expandVendorDetails(response);

  return response;
}

function createErrorResponse (args) {
  var response = _.extend(
    {
      status: "error",
      preConversionCurrency: null,
      offers: {},
      url: null,
      retryDelay: null,
      timestamp: Math.floor(Date.now()/1000),
      ttl: config.ttlForError,
    },
    args
  );

  return response;
}


module.exports = {
  createPendingResponse: createPendingResponse,
  getBookDetails: getBookDetails,
  getBookPrices: getBookPrices,
  getBookPricesForVendor: getBookPricesForVendor,
  doesVendorServeCountry: doesVendorServeCountry,
  isVendorCodeKnown: isVendorCodeKnown,
  enterTestMode: function (cb) {
    client.select(15, function (err) {
      if (err) { return cb(err); }
      client.flushdb(function(err) {
        cb(err);
      });
    });
  }
};
