"use strict";

var path = require("path");

module.exports = {
  retryDelayForPending: 2,
  retryDelayForStale: 2,
  retryDelayForUnfetched: 0.1,

  duplicateScrapeExpiry:  60  * 1000,
  duplicateScrapeBackoff: 1 * 1000,

  ttlForError: 300,

  minimumMaxAgeForPrices: 30,

  getBookPricesForVendorTimeout: 4,

  fallbackCountry:  "US",
  fallbackCurrency: "USD",

  pathToConfigFiles: path.resolve(__dirname),

  exchangeReloadIntervalSeconds: 600, // 10 mins

  api: {
    protocol: "http",
    hostport: "api.openbookprices.com",
  }
};

