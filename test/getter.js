"use strict";

var assert = require("assert"),
    sinon  = require("sinon"),
    fetcher = require("l2b-price-fetchers"),
    getter = require("../src/getter");

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

    // stub the country so that GB is not accepted
    sandbox.stub(fetcher, "fetch").yields(
      null,
      {
        args: {
          vendor: "foyles",
          isbn: "9780340831496",
          country: "GB",
          currency: "GBP",
        },
        url: "http://www.foyles.co.uk/witem/food-drink/mcgee-on-food-and-cooking-an,harold-mcgee-9780340831496",
        title: "McGee on Food and Cooking: An Encyclopedia of Kitchen Science, History and Culture",
        authors: [ "Harold McGee" ],
        prices: [],
      }
    );

    getter.getBookDetails("9780340831496", function (err, details) {
      assert.deepEqual(details, {
        isbn: "9780340831496",
        authors: [ "Harold McGee" ],
        title: "McGee on Food and Cooking: An Encyclopedia of Kitchen Science, History and Culture",
      });
      done();
    });
  });

});
