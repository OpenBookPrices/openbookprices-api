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
      // AQ in Antartica, which has no currency
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

    it("should 200 for good values", function (done) {
      request
        .get("/prices/9780340831496/GB/GBP")
        .expect(200)
        .end(done);
    });

    it.skip("should not initiate any scrape requests");

    it.skip("should set the expiry headers correctly when no responses");

    it.skip("should set the expiry headers correctly when some responses");

    it.skip("should set the expiry headers correctly when all responses");

    it.skip("should convert currency correctly");

  });


  describe("/:isbn/:country/:currency/:vendor", function () {
    it("should 404 for bad vendor", function (done) {
      request
        .get("/prices/9780340831496/GB/GBP/not-a-vendor")
        .expect(404)
        .end(done);
    });

    it("should redirect for fixable country, currency and vendor", function (done) {
      request
        .get("/prices/9780340831496/gb/gBp/fOYLes")
        .expect(301)
        .expect("Location", "/prices/9780340831496/GB/GBP/foyles")
        .end(done);
    });

    it("should 200 for good values", function (done) {
      request
        .get("/prices/9780340831496/GB/GBP/foyles")
        .expect(200)
        .end(done);
    });

    it.skip("should 400 if the vendor does not sell to that country");

    it.skip("should return a try-again response if the scraper times out");

    it.skip("should return an accurate response");

    it.skip("should set the expiry headers correctly");

    it.skip("should retrieve from the cache on subsequent requests");

    it.skip("should only send one request through to the scrapers");

    it.skip("should convert currency correctly");

  });


});
