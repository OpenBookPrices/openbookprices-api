"use strict";

require("./setup");

var assert = require("assert"),
    async = require("async"),
    request = require("supertest"),
    fetcher = require("l2b-price-fetchers"),
    apiApp  = require("../"),
    samples = require("./samples");

request = request(apiApp());

describe("/prices", function () {

  describe("/:isbn", function () {

    it("should redirect to normalised isbn13", function (done) {
      request
        .get("/prices/0340831499")
        .expect(301)
        .expect("Location", "/prices/9780340831496")
        .end(done);
    });

    it("should return 404 when the isbn is not valid", function (done) {
      request
        .get("/prices/123456789")
        .expect(404)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect({ error: "isbn '123456789' is not valid" })
        .end(done);
    });

    it("should redirect to .../GB/GBP", function (done) {
      request
        .get("/prices/9780340831496")
        .set("X-Forwarded-For", "217.64.234.65, 127.0.0.1") // nhs.uk
        .expect(302)
        .expect("Cache-Control", "private, max-age=600")
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should use fallbacks when not able to geolocate", function (done) {
      request
        .get("/prices/9780340831496")
        .set("X-Forwarded-For", "127.0.0.1")
        .expect(302)
        .expect("Cache-Control", "private, max-age=600")
        .expect("Location", "/prices/9780340831496/US/USD")
        .end(done);
    });

  });


  describe("/:isbn/:country", function () {
    it("should 404 for bad country", function (done) {
      request
        .get("/prices/9780340831496/XX")
        .expect(404)
        .end(done);
    });

    it("should redirect for fixable country", function (done) {
      request
        .get("/prices/9780340831496/gb")
        .expect(301)
        .expect("Location", "/prices/9780340831496/GB")
        .end(done);
    });

    it("should redirect to primary currency", function (done) {
      request
        .get("/prices/9780340831496/GB")
        .expect(301)
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should cope with country that has no currency", function (done) {
      // AQ is Antartica, which has no currency
      request
        .get("/prices/9780340831496/AQ")
        .expect(301)
        .expect("Location", "/prices/9780340831496/AQ/USD")
        .end(done);
    });

  });


  describe("/:isbn/:country/:currency", function () {
    it("should 404 for bad currency", function (done) {
      request
        .get("/prices/9780340831496/GB/ABC")
        .expect(404)
        .end(done);
    });

    it("should redirect for fixable currency", function (done) {
      request
        .get("/prices/9780340831496/GB/gBp")
        .expect(301)
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should redirect for fixable country and currency", function (done) {
      request
        .get("/prices/9780340831496/gb/gBp")
        .expect(301)
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should not initiate any scrape requests", function (done) {

      var fetchStub = this.sandbox
        .stub(fetcher, "fetch")
        .yields(null, samples.fetch["9780340831496"]);

      request
        .get("/prices/9780340831496/GB/GBP")
        .expect(200)
        .end(function (err) {
          assert.ifError(err);
          assert(!fetchStub.called);
          done();
        });

    });

    it("should return values after vendor request", function (done) {

      var fetchStub = this.sandbox
        .stub(fetcher, "fetch")
        .yields(null, samples.fetch["9780340831496"]);

      async.series(
        [
          function (cb) {
            // Get the list of prices, should be empty. Should not call the
            // fetch command.
            request
              .get("/prices/9780340831496/GB/GBP")
              .expect(200)
              .expect([{
                vendor: "test-vendor-1",
                isbn: "9780340831496",
                country: "GB",
                currency: "GBP",
                expires: samples.zeroTime/1000,
              }])
              .end(function (err) {
                assert.ifError(err);
                assert.equal(fetchStub.callCount, 0);
                cb();
              });
          },
          function (cb) {
            // hit the vendor endpoint to store the results in cache.
            request
              .get("/prices/9780340831496/GB/GBP/test-vendor-1")
              .expect(200)
              .expect(samples.getBookPricesForVendor["9780340831496"])
              .end(cb);
          },
          this.waitForCache,
          function (cb) {
            // Get the currency endpoint and check that cached values are now
            // included.
            request
              .get("/prices/9780340831496/GB/GBP")
              .expect(200)
              .expect([samples.getBookPricesForVendor["9780340831496"]])
              .end(cb);
          }
        ],
        done
      );
    });

    it.skip("should set the expiry headers correctly when no responses");

    it.skip("should set the expiry headers correctly when some responses");

    it.skip("should set the expiry headers correctly when all responses");

    it.skip("should convert currency correctly");

  });


  describe("/:isbn/:country/:currency/:vendor", function () {

    beforeEach(function () {
      this.fetchStub = this.sandbox
        .stub(fetcher, "fetch")
        .yields(null, samples.fetch["9780340831496"]);
    });

    it("should 404 for bad vendor", function (done) {
      request
        .get("/prices/9780340831496/GB/GBP/not-a-vendor")
        .expect(404)
        .end(done);
    });

    it("should redirect for fixable country, currency and vendor", function (done) {
      request
        .get("/prices/9780340831496/gb/gBp/TEST-veNDor-1")
        .expect(301)
        .expect("Location", "/prices/9780340831496/GB/GBP/test-vendor-1")
        .end(done);
    });

    it("should 400 if the vendor does not sell to that country", function (done) {

      // stub the country so that GB is not accepted
      fetcher.vendorsForCountry.restore();
      this.sandbox
        .stub(fetcher, "vendorsForCountry")
        .withArgs("GB")
        .returns([]);

      request
        .get("/prices/9780340831496/GB/GBP/test-vendor-1")
        .expect(400)
        .end(done);
    });

    it("should return a try-again response if the scraper times out", function (done) {

      var clock = this.sandbox.clock;
      var tickAmountSeconds = 6;

      fetcher.fetch.restore();
      this.fetchStub = this.sandbox
        .stub(fetcher, "fetch", function (args, cb) {
          setTimeout(
            function () {
              cb(null, samples.fetch["9780340831496"]);
            },
            (tickAmountSeconds - 1 ) * 1000
          );

          // advance the clock
          clock.tick(tickAmountSeconds*1000);
        });


        //samples.getBookPricesForVendor["9780340831496"];
      var expectedData = {
        status: "pending",
        retryDelay: 2,
        country: "GB",
        currency: "GBP",
        expires: samples.zeroTime/1000 + tickAmountSeconds,
        formats: {},
        isbn: "9780340831496",
        url: null,
        vendor: "test-vendor-1",
      };

      // console.dir(expectedData);

      async.series(
        [
          function (cb) {
            // send the request that should timeout and give us a pending response
            request
              .get("/prices/9780340831496/GB/GBP/test-vendor-1")
              .expect(200)
              .expect(expectedData)
              // .expect("Expires", (new Date(Date.now() + tickAmountSeconds*1000)).toString())
              // .expect("Cache-Control", "max-age=2")
              .end(cb);
          },
          this.delay(2000),     // wait a little more for the scraper to return
          this.waitForCache,    // let results get saved to cache
          function (cb) {
            // Fire off another request that should get a completed scrape
            request
              .get("/prices/9780340831496/GB/GBP/test-vendor-1")
              .expect(200)
              // .expect("Expires", (new Date( samples.zeroTime + 86400*1000)).toString())
              // .expect("Cache-Control", "max-age=" + Math.floor(86400 - tickAmount/1000))
              .expect(samples.getBookPricesForVendor["9780340831496"])
              .end(cb);
          }
        ],
        done
      );


    });

    it("should return a correctly scraped response", function (done) {

      // tick ahead a fraction of a second to test that the max-age is rounded
      // down to an integer.
      var tickAmount = 300;
      this.sandbox.clock.tick(tickAmount);

      request
        .get("/prices/9780340831496/GB/GBP/test-vendor-1")
        .expect(200)
        .expect("Expires", (new Date( samples.zeroTime + 86400*1000)).toString())
        .expect("Cache-Control", "max-age=" + Math.floor(86400 - tickAmount/1000))
        .expect(samples.getBookPricesForVendor["9780340831496"])
        .end(done);

    });


    it("should retrieve from the cache on subsequent requests", function (done) {
      var runTests = function (cb) {
        request
          .get("/prices/9780340831496/GB/GBP/test-vendor-1")
          .expect(200)
          .expect(samples.getBookPricesForVendor["9780340831496"])
          .end(cb);
      };

      var fetchStub = this.fetchStub;

      async.series(
        [
          runTests,
          this.waitForCache,
          runTests,
        ],
        function (err) {
          assert.ifError(err);
          assert.equal(fetchStub.callCount, 1);
          done();
        }
      );

    });

    it("should store and retrieve all data from one scrape", function (done) {
      var runTests = function (country) {
        return function (cb) {
          request
            .get("/prices/9780340831496/" + country + "/GBP/test-vendor-1")
            .expect(200)
            .end(cb);
        };
      };

      var fetchStub = this.fetchStub;

      async.series(
        [
          runTests("GB"),
          this.waitForCache,
          runTests("US"),
        ],
        function (err) {
          assert.ifError(err);
          assert.equal(fetchStub.callCount, 1);
          done();
        }
      );

    });

    it.skip("should convert currency correctly");

    it.skip("should use some sort of locking to prevent multiple scrapes of the same book details");

    it.skip("should not block for longer than 6 seconds if scrape is slow (perhaps 302?)");

  });


});
