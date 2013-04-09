"use strict";

var geoip        = require("geoip-lite"),
    countryData  = require("country-data"),
    _            = require("underscore");

exports.geolocateFromIP = function (req, res, next) {

  var ip = req.ip;

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
  next();
};
