"use strict";

var express         = require("express"),
    geolocateFromIP = require("./geolocate").geolocateFromIP;

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.get(
  "/determineFromIPAddress",
  geolocateFromIP,
  function (req, res) {
    // This result is specific to the IP address of the request, so should
    // not be cached.
    res.header("Cache-Control", "private, max-age=600");
    res.jsonp(req.geolocatedData);
  }
);

