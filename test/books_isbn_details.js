"use strict";

require("./setup");

var assert = require("assert"),
    request = require("supertest"),
    fetcher = require("openbookprices-fetchers"),
    async = require("async"),
    apiApp  = require("../"),
    helpers = require("../src/helpers"),
    samples = require("./samples");

request = request(apiApp());

describe("/v1/books/:isbn/details", function () {

  var fetchStub;

  beforeEach(function () {
    // stub the fetch so that it does not do a scrape
    fetchStub = this.sandbox
      .stub(fetcher, "getDetails", function (isbn, cb) {
        var details = samples("getDetails-" + isbn);
        cb(null, details);
      });
  });

  it("should return correct details for valid isbn", function (done) {

    var delay = this.delay;

    var testRequest = function (cb) {
      request
        .get("/v1/books/9780340831496/details")
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect("Cache-Control", helpers.cacheControl(86400))
        .expect(samples("getBookDetails-9780340831496"))
        .end(cb);
    };

    async.series(
      [
        testRequest,
        delay(50),
        testRequest,
      ],
      function (err) {
        assert(fetchStub.calledOnce);
        done(err);
      }
    );

  });

  it("should return correct details for not found isbn", function (done) {

    var delay = this.delay;

    // This isbn not found on Amazon as it is a Nook eBook.
    var testRequest = function (cb) {
      request
        .get("/v1/books/9781781100295/details")
        .expect(404)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect("Cache-Control", helpers.cacheControl(86400))
        .expect(samples("getBookDetails-9781781100295"))
        .end(cb);
    };

    async.series(
      [
        testRequest,
        delay(50),
        testRequest,
      ],
      function (err) {
        assert(fetchStub.calledOnce);
        done(err);
      }
    );

  });

});
