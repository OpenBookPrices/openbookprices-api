"use strict";

var path = require("path"),
    config = require("../config");

module.exports.pathToLatestJSON = function () {
  var configDir = config.pathToConfigFiles;
  return path.join(configDir, "exchange_rates.json");
};
