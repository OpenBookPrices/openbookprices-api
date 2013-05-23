"use strict";

var redis   = require("redis"),
    client  = redis.createClient(),
    _       = require("underscore"),
    fetcher = require("l2b-price-fetchers");


client.on("error", function (err) {
  console.log("Redis error " + err);
});




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




// function bookPricesCacheKey (opt) {
//   return ["bookPrice", opt.isbn, opt.country, opt.currency, opt.vendor].join("-");
// }

// function cacheBookPrices (data) {
//   // console.log(data);
//
//   _.each(data.prices, function (price) {
//     _.each( price.countries, function (country) {
//
//       var entry = _.chain(price)
//         .omit("countries")
//         .defaults({country: country})
//         .value();
//
//       var cacheKey = bookPricesCacheKey(entry);
//
//       var ttl = Math.floor(entry.validUntil - new Date().valueOf()/1000);
//
//       client.setex(
//         cacheKey,
//         ttl,
//         JSON.stringify(entry)
//       );
//     });
//   });
// }


module.exports = {
  getBookDetails: getBookDetails,
  vendorCodes: fetcher.vendorCodes(),
  enterTestMode: function (cb) {
    client.select(15, function (err) {
      if (err) { return cb(err); }
      client.flushdb(function(err) {
        cb(err);
      });
    });
  }
};
