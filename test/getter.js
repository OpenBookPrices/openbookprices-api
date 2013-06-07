"use strict";

var assert = require("assert"),
    sinon  = require("sinon"),
    async = require("async"),
    fetcher = require("l2b-price-fetchers"),
    getter = require("../src/getter"),
    samples = require("./samples");

describe("Getter", function () {

  var sandbox;

  beforeEach(function (done) {
    getter.enterTestMode(done);
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should get book details, then cache", function (done) {

    // stub the fetch so that it does not do a scrape
    var fetchStub = sandbox.stub(fetcher, "fetch").yields(
      null,
      samples.fetch["9780340831496"]
    );

    var runTests = function (cb) {
      getter.getBookDetails("9780340831496", function (err, details) {
        assert.ifError(err);
        assert.deepEqual(details, samples.getBookDetails["9780340831496"]);
        cb();
      });
    };

    async.series(
      [
        // Fetch the book data twice, with a slight delay to let redis cache
        runTests,
        function (cb) { setTimeout(cb, 50); },
        runTests,

        // Check that the scape only happened once
        function (cb) {
          assert(fetchStub.calledOnce);
          cb();
        }
      ],
      done
    );

  });

});
