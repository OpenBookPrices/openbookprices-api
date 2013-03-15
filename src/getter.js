"use strict";

var redis   = require("redis"),
    client  = redis.createClient(),
    _       = require("underscore"),
    Fetcher = require("l2b-price-fetchers");


function getBookDetails (isbn, cb) {

  var cacheKey = "details-" + isbn;

  client.get(cacheKey, function (err, reply) {
    if ( reply ) {
      cb( null, JSON.parse(reply) );
    } else {
      fetchFromScrapers(
        {vendor: "foyles", isbn: isbn },
        function (err, results) {
          if (err) { return cb(err); }
          var returnData = _.pick(results, "isbn", "authors", "title");
          // TODO perhaps put an expiry in here...
          client.set(cacheKey, JSON.stringify(returnData));
          cb(null, returnData);
        }
      );
    }
  });

}

function fetchFromScrapers (options, cb) {
  var f = new Fetcher();
  f.fetch(
    options,
    function (err, data) {
      if (err) { return cb(err); }
      cb(null, data);
    }
  );
}


module.exports = {
  getBookDetails: getBookDetails,
};
