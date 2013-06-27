"use strict";

var express         = require("express"),
    getter          = require("./getter"),
    helpers         = require("./helpers"),
    middleware      = require("./middleware");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.param("isbn", middleware.isbn);

// fake handler for the books endpoints
app.get("/:isbn", middleware.redirectToCanonicalURL(["isbn"]), function (req, res, next) {
  var isbn = req.param("isbn");
  getter.getBookDetails(
    isbn,
    function (err, data) {
      if (err) { return next(err); }
      res.set("Cache-Control", helpers.cacheControl(86400));
      res.json(data);
    }
  );
});
