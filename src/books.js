"use strict";

var config          = require("config"),
    express         = require("express"),
    geolocateFromIP = require("./geolocate").geolocateFromIP,
    getter          = require("./getter"),
    helpers         = require("./helpers"),
    middleware      = require("./middleware"),
    _               = require("underscore");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);


app.param("isbn",         middleware.isbn);
app.param("countryCode",  middleware.countryCode);
app.param("currencyCode", middleware.currencyCode);
app.param("vendorCode",   middleware.vendorCode);


app.get("/", function (req, res) {
  var baseUrl = config.api.protocol + "://" + config.api.hostport + "/v1/books/";
  res.header( "Cache-Control", helpers.cacheControl(3600) );
  res.jsonp({
    examples: {
      // Note that these examples should be widely available in all countries
      "Code Complete by Steve McConnell": baseUrl + "9780735619678",
      "Walden by Henry David Thoreau": baseUrl + "9781619493919",
    },
  });
});

app.get("/:isbn", middleware.redirectToCanonicalURL(["isbn"]), function (req, res) {
  var isbn = req.param("isbn");
  var baseUrl = config.api.protocol + "://" + config.api.hostport + "/v1/books/" + isbn + "/";
  res.header( "Cache-Control", helpers.cacheControl(3600) );
  res.jsonp({
    isbn: isbn,
    details: baseUrl + "details",
    prices: baseUrl + "prices",
  });
});

app.get("/:isbn/details", middleware.redirectToCanonicalURL(["isbn", "details"]), function (req, res, next) {
  var isbn = req.param("isbn");
  getter.getBookDetails(
    isbn,
    function (err, data) {
      if (err) { return next(err); }
      res.set("Cache-Control", helpers.cacheControl(86400));
      res.jsonp(data);
    }
  );
});

app.get(
  "/:isbn/prices",
  middleware.redirectToCanonicalURL(["isbn","prices"]),
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
  middleware.redirectToCanonicalURL(["isbn", "prices", "countryCode", "currencyCode"], 302)
);

app.get(
  "/:isbn/prices/:countryCode",
  middleware.redirectToCanonicalURL(["isbn", "prices", "countryCode"]),
  function (req, res, next) {
    req.params.currencyCode = req.country.currencies[0] || config.fallbackCurrency;
    next();
  },
  middleware.redirectToCanonicalURL(["isbn", "prices", "countryCode", "currencyCode"])
);


app.get(
  "/:isbn/prices/:countryCode/:currencyCode",
  middleware.redirectToCanonicalURL(["isbn", "prices", "countryCode", "currencyCode"]),
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
            return Math.floor(vendorEntry.meta.timestamp + vendorEntry.meta.ttl - Date.now() / 1000);
          })
          .min()
          .value();

        maxAge = _.max([maxAge, config.minimumMaxAgeForPrices]);

        var response = {
          request: {
            isbn: req.isbn,
            country: req.country.alpha2,
            currency: req.currency.code,
          },
          results: vendorEntries
        };
        getter.addEndPointUrl(response);

        res.header( "Cache-Control", helpers.cacheControl(maxAge) );
        res.jsonp(response);

      }
    );

  }
);

app.get(
  "/:isbn/prices/:countryCode/:currencyCode/:vendorCode",
  middleware.redirectToCanonicalURL(["isbn", "prices", "countryCode", "currencyCode", "vendorCode"]),
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
        var maxAge = content.meta.retryDelay;
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
        var maxAge = Math.floor(details.meta.timestamp + details.meta.ttl - Date.now() / 1000);

        if (!res.headerSent) {
          res.header( "Cache-Control", helpers.cacheControl(maxAge) );
          res.jsonp(details);
        }
      }
    );
  }
);

