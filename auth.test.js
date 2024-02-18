"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} = require("./auth");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const adminJwt = jwt.sign({ username: "admin", isAdmin: true }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureAdmin", function () {
  test("allows admin through", function () {
    const req = {};
    const res = { locals: { user: jwt.verify(adminJwt, SECRET_KEY) } };
    const next = jest.fn();

    ensureAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test("blocks non-admin", function () {
    const req = {};
    const res = { locals: { user: jwt.verify(testJwt, SECRET_KEY) } };
    const next = jest.fn();

    ensureAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

describe("ensureCorrectUserOrAdmin", function () {
  test("allows correct user", function () {
    const req = { params: { username: "test" }, locals: { user: { username: "test", isAdmin: false } } };
    const res = {};
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test("allows admin for any user", function () {
    const req = { params: { username: "test" }, locals: { user: { username: "admin", isAdmin: true } } };
    const res = {};
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test("blocks incorrect non-admin user", function () {
    const req = { params: { username: "test" }, locals: { user: { username: "otherUser", isAdmin: false } } };
    const res = {};
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
