"use strict";

var path = require("path"),
    config = require("../config"),
    fs = require("fs"),
    fx = require("money"),
    currencies = require("country-data").currencies,
    _ = require("underscore"),
    EventEmitter = require("events").EventEmitter;

var exchange = module.exports = {
  fx: fx,
};

exchange.hub = new EventEmitter();

exchange.convert = function convert (val, fromCurrency, toCurrency) {

  // Perform exchange
  var converted = fx(val).from(fromCurrency).to(toCurrency);

  // round to the required number of decimal places
  var currency = currencies[toCurrency];
  var dps = currency && !_.isNull(currency.decimals) ? currency.decimals : 2;
  var multiplier = Math.pow(10, dps);
  var rounded = Math.round( converted * multiplier ) / multiplier;

  return rounded;
};





exchange.pathToLatestJSON = function () {
  var configDir = config.pathToConfigFiles;
  return path.join(configDir, "exchange_rates.json");
};


exchange.loadLatestJSON = function (sync) {
  var pathToJSON = exchange.pathToLatestJSON();

  if (sync) {
    var fileContents = fs.readFileSync(pathToJSON);
    parseJSONandLoad(null, fileContents);
  } else {
    fs.readFile(pathToJSON, parseJSONandLoad);
  }
};


function parseJSONandLoad (err, fileContents) {
  var data = JSON.parse( fileContents );

  fx.base  = data.base;
  fx.rates = data.rates;

  exchange.hub.emit("reloaded");
}

exchange.calculateDelayUntilNextReload = function () {

  // work out how long to delay to
  var interval = config.exchangeReloadIntervalSeconds * 1000;
  var now = Date.now();
  var delay = now % interval;

  // if too small then delay a little longer, to avoid thrashing.
  if (delay < 1000 ) {
    delay = delay + interval;
  }

  return delay;
};

exchange.initiateDelayAndReload = function () {
  setTimeout(
    function () {
      exchange.initiateDelayAndReload();
      exchange.loadLatestJSON();
    },
    exchange.calculateDelayUntilNextReload()
  );
};

// run this straight away as it is something we want running all the time.
if (fs.existsSync(exchange.pathToLatestJSON())) {
  exchange.loadLatestJSON(true);
  exchange.initiateDelayAndReload();
}

