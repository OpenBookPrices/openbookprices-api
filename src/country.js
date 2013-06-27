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
    res.json(req.geolocatedData);
  }
);

