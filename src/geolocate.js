"use strict";

var geoip        = require("geoip-lite"),
    countryData  = require("country-data"),
    helpers      = require("./helpers"),
    validator    = require("validator"),
    _            = require("underscore");

exports.geolocateFromIP = function (req, res, next) {

  var ip = req.param("ip") || req.ip;

  // validate the IP address. If bad 404
  if (!validator.isIP(ip)) {
    res.status(404);
    res.jsonp({error: "'" + ip + "' is not a valid IP address"});
    return;
  }

  var lookup = geoip.lookup(ip);

  var data = null;

  if (lookup) {
    var country = countryData.countries[lookup.country];
    data = {
      id:         country.alpha2,
      code:       country.alpha2,
      name:       country.name,
      currencies: _.map(
        country.currencies,
        function (code) { return _.pick(countryData.currencies[code], "code", "name"); }
      ),
      ip: ip
    };
  } else {
    data = {
      id:         "",
      name:       "",
      code:       "",
      currencies: [],
      ip:         ip
    };
  }

  req.geolocatedData = data;

  // This result is specific to the IP address of the request, so should
  // not be cached.
  res.header("Cache-Control", helpers.cacheControl(600, true));

  next();
};
