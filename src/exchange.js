"use strict";

var path = require("path"),
    config = require("../config"),
    fs = require("fs"),
    fx = require("money");

var exchange = module.exports;

exchange.pathToLatestJSON = function () {
  var configDir = config.pathToConfigFiles;
  return path.join(configDir, "exchange_rates.json");
};

exchange.fx = fx;

exchange.loadLatestJSONSync = function () {
  var pathToJSON = exchange.pathToLatestJSON();
  var fileContents = fs.readFileSync(pathToJSON);
  var data = JSON.parse( fileContents );
  
  fx.base = data.base;
  fx.rates = data.rates;

  return true;
};

