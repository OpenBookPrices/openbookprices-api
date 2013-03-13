"use strict";

// var assert = require("assert");
var request = require("supertest"),
    apiApp  = require("../");

request = request(apiApp());

describe("Books", function () {
  describe("book details", function () {

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
          title: "Title of 9780340831496",
          author: "Author of 9780340831496",
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
});
