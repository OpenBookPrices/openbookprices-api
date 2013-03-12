"use strict";

// var assert = require("assert");
var request = require("supertest"),
    booksApp = require("../src/books");

request = request(booksApp);

describe("Books", function () {
  describe("bad isbn", function () {
    it("should return 404 when the isbn is not valid", function (done) {
      request
        .get("/123456789")
        .expect(404, done);
    });
  });
});
