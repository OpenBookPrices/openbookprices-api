"use strict";

var assert = require("assert"),
    // sinon  = require("sinon"),
    getter = require("../src/getter");

describe("Getter", function () {

  beforeEach(function (done) {
    getter.enterTestMode(done);
  });

  it("should get book details, then cache", function (done) {



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
