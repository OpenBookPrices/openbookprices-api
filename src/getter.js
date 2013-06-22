"use strict";

var _       = require("underscore"),
    async   = require("async"),
    client  = require("./redis-client"),
    fetcher = require("l2b-price-fetchers");





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
      if (err) { return cb(err); }
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

  var cacheKey = bookPricesCacheKey(args);

  client.get(cacheKey, function (err, reply) {
    if ( reply ) {
      return cb( null, JSON.parse(reply) );
    } else if (args.fromCacheOnly) {

      var emptyResponse = _.omit(args, "fromCacheOnly");
      emptyResponse.expires = Math.floor( new Date() / 1000 );

      return cb( null, emptyResponse);

    } else {
      fetchFromScrapers(
        args,
        function (err, results) {
          if (err) { return cb(err); }
          var bookPrices = extractBookPrices(results);
          cacheBookPrices(bookPrices);
          return cb(null, bookPrices[args.country]);
        }
      );
    }
  });
}


function extractBookPrices (results) {
  var pricesByCountry = {};

  _.each(results.entries, function (entry) {
    _.each( entry.countries, function (country) {

      var countryPrice = _.chain(entry)
        .omit("countries", "ttl")
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

    var ttl = Math.floor(entry.expires - Date.now()/1000);

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




module.exports = {
  getBookDetails: getBookDetails,
  getBookPrices: getBookPrices,
  getBookPricesForVendor: getBookPricesForVendor,
  vendorCodes: fetcher.vendorCodes(),
  doesVendorServeCountry: doesVendorServeCountry,
  enterTestMode: function (cb) {
    client.select(15, function (err) {
      if (err) { return cb(err); }
      client.flushdb(function(err) {
        cb(err);
      });
    });
  }
};
