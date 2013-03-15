"use strict";

var
    // redis   = require("redis"),
    // client  = redis.createClient(),
    _       = require("underscore"),
    Fetcher = require("l2b-price-fetchers");


function getBookDetails (isbn, cb) {
  fetchFromScrapers(
    {vendor: "foyles", isbn: isbn },
    function (err, results) {
      if (err) { return cb(err); }
      var returnData = _.pick(results, "isbn", "authors", "title");
      cb(null, returnData);
    }
  );
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
