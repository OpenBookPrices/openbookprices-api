"use strict";

require("./setup");

var assert = require("assert"),
    request = require("supertest"),
    fetcher = require("l2b-price-fetchers"),
    async = require("async"),
    apiApp  = require("../"),
    helpers = require("../src/helpers"),
    samples = require("./samples");

request = request(apiApp());

describe("/books", function () {

  var fetchStub;

  beforeEach(function () {
    // stub the fetch so that it does not do a scrape
    fetchStub = this.sandbox
      .stub(fetcher, "fetch")
      .yields(null, samples.fetch["9780340831496"]);
  });

  describe("/:isbn", function () {

    it("should redirect to normalised isbn13", function (done) {
      request
        .get("/books/0340831499")
        .expect(301)
        .expect("Location", "/books/9780340831496")
        .end(function (err) {
          assert(!fetchStub.called);
          done(err);
        });
    });

    it("should return 404 when the isbn is not valid", function (done) {
      request
        .get("/books/123456789")
        .expect(404)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect({ error: "isbn '123456789' is not valid" })
        .end(function (err) {
          assert(!fetchStub.called);
          done(err);
        });
    });

    it("should return correct details for valid isbn", function (done) {

      var delay = this.delay;

      var testRequest = function (cb) {
        request
          .get("/books/9780340831496")
          .expect(200)
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect("Cache-Control", helpers.cacheControl(86400))
          .expect(samples.getBookDetails["9780340831496"])
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

});
