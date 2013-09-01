"use strict";

var express         = require("express"),
    getter          = require("./getter"),
    _               = require("underscore"),
    middleware      = require("./middleware"),
    geolocateFromIP = require("./geolocate").geolocateFromIP,
    helpers         = require("./helpers"),
    config          = require("config");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.param("isbn",         middleware.isbn);
app.param("countryCode",  middleware.countryCode);
app.param("currencyCode", middleware.currencyCode);
app.param("vendorCode",   middleware.vendorCode);

app.get(
  "/:isbn",
  middleware.redirectToCanonicalURL(["isbn"]),
  geolocateFromIP,
  function (req, res, next) {

    var countryCode  = req.geolocatedData.code || config.fallbackCountry;
    var currencyCode =
      req.geolocatedData.currencies.length  ?
      req.geolocatedData.currencies[0].code :
      config.fallbackCurrency;

    req.params.countryCode = countryCode;
    req.params.currencyCode = currencyCode;

    next();
  },
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode"], 302)
);

app.get(
  "/:isbn/:countryCode",
  middleware.redirectToCanonicalURL(["isbn", "countryCode"]),
  function (req, res, next) {
    req.params.currencyCode = req.country.currencies[0] || config.fallbackCurrency;
    next();
  },
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode"])
);


app.get(
  "/:isbn/:countryCode/:currencyCode",
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode"]),
  function (req, res, next) {

    getter.getBookPrices(
      {
        isbn: req.isbn,
        country: req.country.alpha2,
        currency: req.currency.code,
      },
      function (err, results) {
        if (err) {
          return next(err);
        }

        var vendorEntries = _.values(results);

        // Set the cache header. Make it the same as the scrape ttl.
        var maxAge = _.chain(vendorEntries)
          .map(function (vendorEntry) {
            return Math.floor(vendorEntry.timestamp + vendorEntry.ttl - Date.now() / 1000);
          })
          .min()
          .value();

        maxAge = _.max([maxAge, config.minimumMaxAgeForPrices]);

        res.header( "Cache-Control", helpers.cacheControl(maxAge) );
        res.jsonp( vendorEntries );

      }
    );

  }
);

app.get(
  "/:isbn/:countryCode/:currencyCode/:vendorCode",
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode", "vendorCode"]),
  function (req, res, next) {
    // check that the vendor sells to this country
    if (!getter.doesVendorServeCountry(req.vendor, req.country.alpha2)) {
      return res.jsonp(400, {error: "Vendor does not sell to that country"});
    }
    next();
  },
  function (req, res, next) {

    var getterArgs = {
      isbn: req.isbn,
      vendor: req.vendor,
      country: req.country.alpha2,
      currency: req.currency.code,
    };

    // The scrape may take too long, so set a timeout. If it triggers send a pending
    // response to the client and let the scrape continue in the background.
    setTimeout(
      function () {
        // Set the max age header
        var content = getter.createPendingResponse(getterArgs);
        var maxAge = content.retryDelay;
        if (!res.headerSent) {
          res.header("Cache-Control", helpers.cacheControl(maxAge));
          res.jsonp(content);
        }
      },
      config.getBookPricesForVendorTimeout * 1000
    );

    getter.getBookPricesForVendor(
      getterArgs,
      function (err, details) {
        if (err) {
          return next(err);
        }

        // Set the cache header. Make it the same as the scrape ttl.
        var maxAge = Math.floor(details.timestamp + details.ttl - Date.now() / 1000);

        if (!res.headerSent) {
          res.header( "Cache-Control", helpers.cacheControl(maxAge) );
          res.jsonp(details);
        }
      }
    );
  }
);













