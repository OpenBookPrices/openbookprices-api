"use strict";

// var assert = require("assert");
var request = require("supertest"),
    apiApp  = require("../");

request = request(apiApp());

describe("/country", function () {
  describe("/determineFromIPAddress", function () {

    it("should return default for non-geo ip", function (done) {
      request
        .get("/country/determineFromIPAddress")
        .expect(200)
        .expect({ id: "", name: "not known", ip: "127.0.0.1" })
        .end(done);
    });


    it("UK IP address", function (done) {
      request
        .get("/country/determineFromIPAddress")
        .set("X-Forwarded-For", "217.64.234.65, 127.0.0.1") // nhs.uk
        .expect(200)
        .expect({
          id: "GB",
          code: "GB",
          name: "United Kingdom",
          defaultCurrency: "GBP",
          ip: "217.64.234.65"
        })
        .end(done);
    });

    it("US IP address", function (done) {
      request
        .get("/country/determineFromIPAddress")
        .set("X-Forwarded-For", "173.223.104.110, 127.0.0.1") // whitehouse.gov
        .expect(200)
        .expect({
          id:   "US",
          code: "US",
          name: "United States",
          defaultCurrency: "USD",
          ip: "173.223.104.110"
        })
        .end(done);
    });

    it("French IP address", function (done) {
      request
        .get("/country/determineFromIPAddress")
        .set("X-Forwarded-For", "217.70.184.1, 127.0.0.1") // gandi.net
        .expect(200)
        .expect({
          id:   "FR",
          code: "FR",
          name: "France",
          defaultCurrency: "EUR",
          ip: "217.70.184.1"
        })
        .end(done);
    });


  });

  describe("/:slug", function () {
    // FIXME
  });
});
