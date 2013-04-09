"use strict";

var express = require("express"),
    geoip   = require("geoip-lite"),
    countryData = require("country-data"),
    _            = require("underscore");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.get("/determineFromIPAddress", convertIPtoCountry);
// app.get("/:slug", slugHandler);


function convertIPtoCountry(req, res) {

  // This result is specific to the IP address of the request, so should not be cached.
  res.header("Cache-Control", "private, max-age=600");

  var ip = req.ip;

  var lookup = geoip.lookup(ip);

  var data = loadCountryData(lookup ? lookup.country : null);
  data.ip = ip;
  res.jsonp(data);

}

// function slugHandler(req, res, next) {
// 
//   var slug = req.param("slug");
// 
//   loadCountryData(slug, function (err, data) {
//     if (err)   { return next(err); }
//     if (!data) { return next("404"); }
//     res.jsonp(data);
//   });
// 
// }

function loadCountryData(code) {
  var data;
  if (code) {
    var reference = countryData.countries[code];
    data = {
      id: code,
      code: code,
      name: reference.name,
      currencies: _.map(reference.currencies, function (code) { return _.pick(countryData.currencies[code], "code", "name"); } ),
    };
  } else {
    data = { id: "", name: "", code: "", currencies: [] };
  }

  return data;
}
