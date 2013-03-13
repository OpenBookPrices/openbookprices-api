"use strict";

// var assert = require("assert");
var request = require("supertest"),
    booksApp = require("../src/books");

request = request(booksApp);

describe("Books", function () {
  describe("book details", function () {

    it("should return 404 when the isbn is not valid", function (done) {
      request
        .get("/123456789")
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ error: "isbn '123456789' is not valid" })
        .end(done);
    });

    it("should return 404 when the isbn is not valid (callback)", function (done) {
      request
        .get("/123456789?callback=foobar")
        .expect(404)
        .expect('Content-Type', 'text/javascript; charset=utf-8')
        .expect(/^foobar && foobar\(\{/)
        .end(done);
    });

    it("should return correct details for valid isbn", function (done) {
      request
        .get("/9780340831496")
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({
          isbn: '9780340831496',
          title: 'Title of 9780340831496',
          author: 'Author of 9780340831496',
        })
        .end(done);
    });

    it("should return correct details in callback", function (done) {
      request
        .get("/9780340831496?callback=foobar")
        .expect(200)
        .expect('Content-Type', 'text/javascript; charset=utf-8')
        .expect(/^foobar && foobar\(\{/)
        .end(done);
    });

  });
});
