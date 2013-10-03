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

describe("/books/:isbn/details", function () {

  var fetchStub;

  beforeEach(function () {
    // stub the fetch so that it does not do a scrape
    fetchStub = this.sandbox
      .stub(fetcher, "fetch")
      .yields(null, samples("fetch-9780340831496"));
  });

  it("should return correct details for valid isbn", function (done) {

    var delay = this.delay;

    var testRequest = function (cb) {
      request
        .get("/books/9780340831496/details")
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

});
