"use strict";

// var assert = require("assert");
var request = require("supertest"),
    apiApp  = require("../");

request = request(apiApp());

describe("/prices", function () {

  describe("/:isbn", function () {

    it("should redirect to normalised isbn13", function (done) {
      request
        .get("/prices/0340831499")
        .expect(302)
        .expect("Location", "/prices/9780340831496")
        .end(done);
    });

    it("should redirect to normalised isbn13 (callback)", function (done) {
      request
        .get("/prices/0340831499?callback=foobar")
        .expect(302)
        .expect("Location", "/prices/9780340831496?callback=foobar")
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

    it("should return 404 when the isbn is not valid (callback)", function (done) {
      request
        .get("/prices/123456789?callback=foobar")
        .expect(404)
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(/^foobar && foobar\(\{/)
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

    it("should preserve callbacks", function (done) {
      request
        .get("/prices/9780340831496?callback=foo")
        .expect(302)
        .expect("Cache-Control", "private, max-age=600")
        .expect("Location", "/prices/9780340831496/US/USD?callback=foo")
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
        .expect(302)
        .expect("Location", "/prices/9780340831496/GB")
        .end(done);
    });

    it("should redirect to primary currency", function (done) {
      request
        .get("/prices/9780340831496/GB")
        .expect(302)
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should redirect to primary currency (with callback)", function (done) {
      request
        .get("/prices/9780340831496/GB?callback=foo")
        .expect(302)
        .expect("Location", "/prices/9780340831496/GB/GBP?callback=foo")
        .end(done);
    });

    it("should cope with no currency", function (done) {
      // AQ in Antartica, which has no currency
      request
        .get("/prices/9780340831496/AQ")
        .expect(302)
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
        .expect(302)
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should redirect for fixable country and currency", function (done) {
      request
        .get("/prices/9780340831496/gb/gBp")
        .expect(302)
        .expect("Location", "/prices/9780340831496/GB/GBP")
        .end(done);
    });

    it("should 200 for good values", function (done) {
      request
        .get("/prices/9780340831496/GB/GBP")
        .expect(200)
        .end(done);
    });
  });

});
