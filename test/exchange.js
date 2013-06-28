"use strict";

var exchange = require("../src/exchange"),
    assert = require("assert");

describe("Exchange", function () {
  describe("Load and keep fresh the exchange rates", function () {

    it("should be using test path", function () {
      // check it is faked out for tests
      var stubbedPath = "config/initial_exchange_rates.json";
      assert.equal( exchange.pathToLatestJSON(), stubbedPath);

      // check it is normally correct
      exchange.pathToLatestJSON.restore();
      assert.notEqual( exchange.pathToLatestJSON(), stubbedPath);
    });

    it("fx object should have rates and base loaded", function () {

      assert.equal(exchange.convert(100, "GBP", "USD"), 153.85  );  // 2 dp
      assert.equal(exchange.convert(100, "GBP", "JPY"), 15083   );  // 0 dp
      assert.equal(exchange.convert(100, "GBP", "LYD"), 195.385 );  // 3 dp
      assert.equal(exchange.convert(100, "GBP", "XAG"), 6.15    );  // null dp

    });

  });
});

