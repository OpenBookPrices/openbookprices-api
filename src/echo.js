"use strict";

var express = require("express");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.all(
  "*",
  function (req, res) {
    res.jsonp({
      timestamp: Date.now()/1000,
      network: {
        ip: req.ip,
        ips: req.ips,
      },
    });

  }
);

