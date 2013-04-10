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

    it("should redirect to normalised isbn13 (callback)", function (done) {
      request
        .get("/books/0340831499?callback=foobar")
        .expect(302)
        .expect("Location", "/books/9780340831496?callback=foobar")
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

    it("should return 404 when the isbn is not valid (callback)", function (done) {
      request
        .get("/books/123456789?callback=foobar")
        .expect(404)
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(/^foobar && foobar\(\{/)
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

    it("should return correct details in callback", function (done) {
      request
        .get("/books/9780340831496?callback=foobar")
        .expect(200)
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(/^foobar && foobar\(\{/)
        .end(done);
    });

  });

  describe("/:isbn/prices", function () {

    it("should redirect to .../GB/GBP", function (done) {
      request
        .get("/books/9780340831496/prices")
        .set("X-Forwarded-For", "217.64.234.65, 127.0.0.1") // nhs.uk
        .expect(302)
        .expect("Cache-Control", "private, max-age=600")
        .expect("Location", "/books/9780340831496/prices/GB/GBP")
        .end(done);
    });

    it("should use fallbacks when not able to geolocate", function (done) {
      request
        .get("/books/9780340831496/prices")
        .set("X-Forwarded-For", "127.0.0.1")
        .expect(302)
        .expect("Cache-Control", "private, max-age=600")
        .expect("Location", "/books/9780340831496/prices/US/USD")
        .end(done);
    });

    it("should preserve callbacks", function (done) {
      request
        .get("/books/9780340831496/prices?callback=foo")
        .expect(302)
        .expect("Cache-Control", "private, max-age=600")
        .expect("Location", "/books/9780340831496/prices/US/USD?callback=foo")
        .end(done);
    });

  });


  describe("/:isbn/prices/:country", function () {
    it("should 404 for bad country", function (done) {
      request
        .get("/books/9780340831496/prices/XX")
        .expect(404)
        .end(done);
    });

    it("should redirect to primary currency", function (done) {
      request
        .get("/books/9780340831496/prices/GB")
        .expect(302)
        .expect("Location", "/books/9780340831496/prices/GB/GBP")
        .end(done);
    });

    it("should redirect to primary currency (with callback)", function (done) {
      request
        .get("/books/9780340831496/prices/GB?callback=foo")
        .expect(302)
        .expect("Location", "/books/9780340831496/prices/GB/GBP?callback=foo")
        .end(done);
    });
  });


  describe("/:isbn/prices/:country/:currency", function () {
    it("should 404 for bad currency", function (done) {
      request
        .get("/books/9780340831496/prices/GB/ABC")
        .expect(404)
        .end(done);
    });

    it("should 200 for good values", function (done) {
      request
        .get("/books/9780340831496/prices/GB/GBP")
        .expect(200)
        .end(done);
    });
  });

});
