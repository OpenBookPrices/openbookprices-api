"use strict";

var express = require("express"),
    geoip   = require("geoip-lite");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

var fallbackIP = "217.64.234.65"; // nhs.uk

app.get("/determineFromIPAddress", convertIPtoCountry);
app.get("/:slug", slugHandler);


function convertIPtoCountry(req, res, next) {

  // This result is specific to the IP address of the request, so should not be cached.
  res.header("Cache-Control", "private, max-age=600");

  var ip = req.ip;
  if (!ip || ip == "127.0.0.1") {
    ip = fallbackIP;
  }
  
  var data = geoip.lookup(ip);
        
  // This means that the IP address could not be looked up. Not an error for us.
  if (data) {
    req.params.slug = data.country;
    slugHandler(req, res, next);
  } else {
    res.jsonp({ id: "", name: "not known" });
  }
}

function slugHandler(req, res, next) {

  var slug = req.param("slug");

  loadCountryData(slug, function (err, data) {
    if (err)   { return next(err); }
    if (!data) { return next("404"); }
    res.jsonp(data);
  });

}

function loadCountryData(code, cb) {
  var data = {
    id:   code,
    code: code,
    name: code,
    defaultCurrency: "GBP",
  };

  cb(null, data);
}
