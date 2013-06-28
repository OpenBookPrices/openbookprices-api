"use strict";

var path = require("path"),
    config = require("../config"),
    fs = require("fs"),
    fx = require("money"),
    currencies = require("country-data").currencies,
    _ = require("underscore");

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

exchange.convert = function (val, fromCurrency, toCurrency) {

  // Perform exchange
  var converted = fx(val).from(fromCurrency).to(toCurrency);

  // round to the required number of decimal places
  var currency = currencies[toCurrency];
  var dps = currency && !_.isNull(currency.decimals) ? currency.decimals : 2;
  var multiplier = Math.pow(10, dps);
  var rounded = Math.round( converted * multiplier ) / multiplier;

  return rounded;
};
