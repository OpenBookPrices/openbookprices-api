"use strict";

var express         = require("express"),
    getter          = require("./getter"),
    helpers         = require("./helpers"),
    middleware      = require("./middleware");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.param("isbn", middleware.isbn);

app.get("/", function (req, res) {
  res.jsonp({FIXME: "Add example links here"});
});

app.get("/:isbn", middleware.redirectToCanonicalURL(["isbn"]), function (req, res) {
  var isbn = req.param("isbn");
  res.jsonp({isbn: isbn, FIXME: "add more example urls here"});
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
