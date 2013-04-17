"use strict";

// var assert = require("assert");
var request = require("supertest"),
    apiApp  = require("../");

request = request(apiApp());

describe("/books", function () {

  describe("/:isbn", function () {

    it("should redirect to normalised isbn13", function (done) {
      request
        .get("/books/0340831499")
        .expect(302)
        .expect("Location", "/books/9780340831496")
        .end(done);
    });

    it("should return 404 when the isbn is not valid", function (done) {
      request
        .get("/books/123456789")
        .expect(404)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect({ error: "isbn '123456789' is not valid" })
        .end(done);
    });

    it("should return correct details for valid isbn", function (done) {
      request
        .get("/books/9780340831496")
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect({
          isbn: "9780340831496",
          title: "McGee on Food and Cooking: An Encyclopedia of Kitchen Science, History and Culture",
          authors: ["Harold McGee"],
        })
        .end(done);
    });

  });

});
