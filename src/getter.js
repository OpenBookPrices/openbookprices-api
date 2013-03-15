"use strict";

var
    // redis   = require("redis"),
    // client  = redis.createClient(),
    _       = require("underscore"),
    Fetcher = require("l2b-price-fetchers");


module.exports.getBookDetails = function (isbn, cb) {

  var f = new Fetcher();
  f.fetch(
    {vendor: "foyles", isbn: isbn },
    function (err, data) {
      if (err) { return cb(err); }
      var returnData = _.pick(data, "isbn", "authors", "title");
      cb(null, returnData);
    }
  );
};
