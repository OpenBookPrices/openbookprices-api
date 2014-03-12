"use strict";

require("./setup");

var assert = require("assert"),
    async = require("async"),
    fetcher = require("openbookprices-fetchers"),
    getter = require("../src/getter"),
    samples = require("./samples"),
    config = require("config");


describe("Getter", function () {

  beforeEach(function () {
    // stub the fetch so that it does not do a scrape
    this.fetchStub = this.sandbox.stub(fetcher, "fetch").yields(
      null,
      samples("fetch-9780340831496")
    );
    this.getDetailsStub = this.sandbox.stub(fetcher, "getDetails").yields(
      null,
      samples("getDetails-9780340831496")
    );
  });

  it("should get book details, then cache", function (done) {
    var test = this;

    var runTests = function (cb) {
      getter.getBookDetails("9780340831496", function (err, details) {
        assert.ifError(err);
        assert.deepEqual(details, samples("getBookDetails-9780340831496"));
        cb();
      });
    };

    async.series(
      [
        // Fetch the book data twice, with a slight delay to let redis cache
        runTests,
        test.waitForCache,
        runTests,

        // Check that the scape only happened once
        function (cb) {
          assert.equal(test.getDetailsStub.callCount, 1);
          cb();
        }
      ],
      done
    );
  });

  it("should get book price, then cache", function (done) {

    var test = this;

    var runTests = function (cb) {
      getter.getBookPricesForVendor(
        { isbn: "9780340831496", vendor: "test_vendor_1", country: "GB", currency: "GBP"},
        function (err, details) {
          assert.ifError(err);
          assert.deepEqual(
            details,
            samples("getBookPricesForVendor-9780340831496")
          );
          cb();
        }
      );
    };

    async.series(
      [
        // Fetch the book data twice, with a slight delay to let redis cache
        runTests,
        test.waitForCache,
        runTests,

        // Check that the scape only happened once
        function (cb) {
          assert(test.fetchStub.calledOnce);
          cb();
        }
      ],
      done
    );
  });


  it("should return prices for all vendors from cache", function (done) {

    async.series(
      [
        function (cb) {
          getter.getBookPrices(
            { isbn: "9780340831496", country: "GB", currency: "GBP"},
            function (err, prices) {
              assert.ifError(err);
              assert.deepEqual(
                prices,
                [
                  {
                    status: "unfetched",
                    request:{
                      isbn: "9780340831496",
                      country: "GB",
                      currency: "GBP",
                      vendor: "test_vendor_1",
                      url: config.api.protocol + "://" + config.api.hostport + "/v1/books/9780340831496/prices/GB/GBP/test_vendor_1",
                    },
                    offers: {},
                    vendor: {
                      code: "test_vendor_1",
                      name: "Test Vendor 1",
                      homepage: "http://www.test-vendor-1.co.uk/",
                      url: null,
                    },
                    meta: {
                      timestamp: Date.now()/1000,
                      ttl: 0,
                      retryDelay: config.retryDelayForUnfetched,
                      preConversionCurrency: null,
                    },
                  }
                ]
              );
              cb();
            }
          );
        },
        function (cb) {
          getter.getBookPricesForVendor(
            { isbn: "9780340831496", vendor: "test_vendor_1", country: "GB", currency: "GBP"},
            function (err, details) {
              assert.ifError(err);
              assert.deepEqual(
                details,
                samples("getBookPricesForVendor-9780340831496")
              );
              cb();
            }
          );
        },
        function (cb) {
          getter.getBookPrices(
            { isbn: "9780340831496", country: "GB", currency: "GBP"},
            function (err, prices) {
              assert.ifError(err);
              assert.deepEqual(
                prices,
                [samples("getBookPricesForVendor-9780340831496")]
              );
              cb();
            }
          );
        }
      ],
      done
    );


  });

});
