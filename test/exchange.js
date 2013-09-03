"use strict";

require("./setup");

var exchange = require("../src/exchange"),
    assert = require("assert"),
    config = require("config"),
    async = require("async");

describe("Exchange", function () {

  describe("rounding", function () {
    it("should round as expected", function() {
      assert.equal( exchange.round("USD", 33.38 + 10.74), 44.12);
    });
  });

  describe("Load and keep fresh the exchange rates", function () {

    it("should be using test path", function () {
      // check it is faked out for tests
      var stubbedPath = "config/initial_exchange_rates.json";
      assert.equal( exchange.pathToLatestJSON(), stubbedPath);

      // check it is normally correct
      exchange.pathToLatestJSON.restore();
      assert.notEqual( exchange.pathToLatestJSON(), stubbedPath);
    });

    it("fx object should convert correctly", function () {
      assert.equal(exchange.convert(100, "GBP", "USD"), 153.85  );  // 2 dp
      assert.equal(exchange.convert(100, "GBP", "JPY"), 15083   );  // 0 dp
      assert.equal(exchange.convert(100, "GBP", "LYD"), 195.385 );  // 3 dp
      assert.equal(exchange.convert(100, "GBP", "XAG"), 6.15    );  // null dp
    });

    it("should reload exchange rates periodically", function (done) {
      var fx = exchange.fx;
      var clock = this.sandbox.clock;

      // change one of the exchange rates to test for the reload
      var originalGBP = fx.rates.GBP;
      fx.rates.GBP = 123.456;

      // start the delayAndReload
      exchange.initiateDelayAndReload();

      // work out how long to wait
      var delay = exchange.calculateDelayUntilNextReload();

      // go almost to the roll over and check no change
      clock.tick( delay-10 );
      assert.equal(fx.rates.GBP, 123.456);

      async.series([
        function (cb) {
          // go past rollover and check for change
          exchange.hub.once("reloaded", function () {
            assert.equal(fx.rates.GBP, originalGBP);
            cb();
          });
          clock.tick( 20 );
        },
        function (cb) {
          // reset it again and go ahead another interval and check for change
          fx.rates.GBP = 123.456;
          exchange.hub.once("reloaded", function () {
            assert.equal(fx.rates.GBP, originalGBP);
            cb();
          });
          clock.tick( config.exchangeReloadIntervalSeconds * 1000 );
        }
      ], done);

    });

    it.skip("should handle bad exchange rates JSON");

  });
});

