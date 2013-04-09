"use strict";

var express = require("express"),
    geoip   = require("geoip-lite"),
    countryData = require("country-data"),
    _            = require("underscore");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.get("/determineFromIPAddress", geolocateFromIP, determineFromIPAddress);


function geolocateFromIP (req, res, next) {

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
}


function determineFromIPAddress(req, res) {

  // This result is specific to the IP address of the request, so should not be cached.
  res.header("Cache-Control", "private, max-age=600");

  res.jsonp(req.geolocatedData);

}

