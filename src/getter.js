"use strict";

var redis   = require("redis"),
    client  = redis.createClient(),
    _       = require("underscore"),
    Fetcher = require("l2b-price-fetchers");


function bookDetailsCacheKey (isbn) {
  return "details-" + isbn;
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
      cb(null, data);
    }
  );
}


module.exports = {
  getBookDetails: getBookDetails,
};
