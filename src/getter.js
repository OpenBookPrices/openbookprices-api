"use strict";

var _       = require("underscore"),
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
    if (!err && !exists) {
      // TODO perhaps put an expiry in here...
      var bookDetails = extractBookDetails(data);
      client.set(cacheKey, JSON.stringify(bookDetails));
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


function getBookPrices (args, cb) {

  var cacheKey = bookPricesCacheKey(args);

  client.get(cacheKey, function (err, reply) {
    if ( reply ) {
      cb( null, JSON.parse(reply) );
    } else {
      fetchFromScrapers(
        args,
        function (err, results) {
          if (err) { return cb(err); }
          var bookPrices = extractBookPrices(results);
          cacheBookPrices(bookPrices);
          cb(null, bookPrices[args.country]);
        }
      );
    }
  });
}


function extractBookPrices (results) {
  var pricesByCountry = {};

  _.each(results.prices, function (price) {
    _.each( price.countries, function (country) {

      var entry = _.chain(price)
        .omit("countries")
        .defaults({country: country})
        .value();

      entry.validUntil = new Date().valueOf()/1000 + entry.ttl;

      pricesByCountry[country] = entry;

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

    var ttl = Math.floor(entry.validUntil - new Date().valueOf()/1000);

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
