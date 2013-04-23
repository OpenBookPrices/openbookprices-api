"use strict";

var redis   = require("redis"),
    client  = redis.createClient(),
    _       = require("underscore"),
    Fetcher = require("l2b-price-fetchers");


var vendorCodes = _.keys(Fetcher.prototype.scrapers);


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
        {vendor: "foyles", isbn: isbn },
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
  return _.pick(results, "isbn", "authors", "title");
}


function cacheBookDetails (data) {
  var isbn = data.isbn;
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
  var f = new Fetcher();
  f.fetch(
    options,
    function (err, data) {
      if (err) { return cb(err); }
      cacheBookDetails(data);
      cacheBookPrices(data);
      cb(null, data);
    }
  );
}




function bookPricesCacheKey (opt) {
  return ["bookPrice", opt.isbn, opt.country, opt.currency, opt.vendor].join("-");
}

function cacheBookPrices (data) {
  // console.log(data);

  _.each(data.prices, function (price) {
    _.each( price.countries, function (country) {

      var entry = _.chain(price)
        .omit("countries")
        .defaults({country: country})
        .value();

      var cacheKey = bookPricesCacheKey(entry);

      var ttl = Math.floor(entry.validUntil - new Date().valueOf()/1000);

      client.setex(
        cacheKey,
        ttl,
        JSON.stringify(entry)
      );
    });
  });
}


module.exports = {
  getBookDetails: getBookDetails,
  vendorCodes: vendorCodes,
};
