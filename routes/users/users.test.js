const sinon = require("sinon");
const supertest = require("supertest");

const User = require("../../model/User");
const userService = require("../../service/user/userService");

const users = require("../../service/api/users/users");
const userSettingsService = require("../../service/user/userSettingsService");
const metrics = require("../../service/api/users/metrics");
const passport = require("../../auth");
const ObjectId = require("mongoose").Types.ObjectId;

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const handleError = require("../../middleware/errorMiddleware");
app.use(bodyParser.json());
app.use(express.json());

// Mock authenticateToken
// Order must prevail
const passportStub = sinon
  .stub(passport, "authenticate")
  .callsFake((strategy, options, callback) => {
    return (req, res, next) => {
      req.user = {
        _id: new ObjectId("123456789123"),
      };
      next();
    };
  });

app.use("/users", require("./users"));
app.use(handleError);

describe("GET /users/:id", () => {
  let usersStub;

  beforeEach(() => {
    usersStub = sinon.stub(users, "getUser");
  });
  afterEach(() => {
    usersStub.restore();
  });

  it("should return user", async () => {
    usersStub.resolves(
      new User({
        email: "test",
        name: "test",
      })
    );

    const response = await supertest(app).get("/users/1");

    expect(response.status).toBe(200);
  });
});

describe("PUT /users/:id", () => {
  let userServiceStub;

  beforeEach(() => {
    userServiceStub = sinon.stub(userService, "updateUser");
  });
  afterEach(() => {
    userServiceStub.restore();
  });

  it("should return forbiden on invalid user id", async () => {
    const response = await supertest(app).put("/users/2").send({
      email: "test",
      name: "test",
    });

    expect(response.status).toBe(403);
  });

  it("should return updated user", async () => {
    userServiceStub.resolves({
      id: 1,
    });

    const response = await supertest(app).put("/users/123456789123").send({
      email: "test",
      name: "test",
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(1);
  });
});

describe("GET /users/:id/settings", () => {
  let userSettingsServiceStub;

  beforeEach(() => {
    userSettingsServiceStub = sinon.stub(userSettingsService, "getSettings");
  });
  afterEach(() => {
    userSettingsServiceStub.restore();
  });

  it("retun forbidden on invalid user id", async () => {
    const response = await supertest(app).get("/users/2/settings");

    expect(response.status).toBe(403);
  });

  it("should return user settings", async () => {
    userSettingsServiceStub.resolves({
      lang: "en",
      theme: "light",
      notifications: true,
    });

    const response = await supertest(app).get("/users/123456789123/settings");

    expect(response.status).toBe(200);
    expect(response.body.lang).toEqual("en");
    expect(response.body.theme).toEqual("light");
    expect(response.body.notifications).toEqual(true);
  });
});

describe("PATCH /users/:id/settings", () => {
  let userSettingsServiceStub;

  beforeEach(() => {
    userSettingsServiceStub = sinon.stub(userSettingsService, "updateSettings");
  });
  afterEach(() => {
    userSettingsServiceStub.restore();
  });

  it("Shoud return forbidden on invalid user id", async () => {
    const response = await supertest(app).patch("/users/2/settings").send({
      lang: "en",
      theme: "light",
      notifications: true,
    });

    expect(response.status).toBe(403);
  });

  it("Should return updated settings", async () => {
    userSettingsServiceStub.resolves({
      lang: "en",
      theme: "light",
      notifications: true,
    });

    const response = await supertest(app)
      .patch("/users/123456789123/settings")
      .send({
        lang: "en",
        theme: "light",
        notifications: true,
      });

    expect(response.status).toBe(200);
  });
});

describe("DELETE /users/:id/settings", () => {
  let userSettingsServiceStub;

  beforeEach(() => {
    userSettingsServiceStub = sinon.stub(userSettingsService, "resetSettings");
  });
  afterEach(() => {
    userSettingsServiceStub.restore();
  });

  it("Shoud return forbidden on invalid user id", async () => {
    const response = await supertest(app).delete("/users/2/settings").send();

    expect(response.status).toBe(403);
  });

  it("Should return updated settings", async () => {
    userSettingsServiceStub.resolves({
      lang: "en",
      theme: "light",
      notifications: true,
    });

    const response = await supertest(app)
      .delete("/users/123456789123/settings")
      .send();

    expect(response.status).toBe(200);
  });
});

describe("GET /users/:id/metrics", () => {
  let getMetricsStub;

  beforeEach(() => {
    getMetricsStub = sinon.stub(metrics, "getMetrics");
  });

  afterEach(() => {
    getMetricsStub.restore();
  });

  it("Should return metrics", async () => {
    getMetricsStub.resolves({
      metrics: [],
    });

    const response = await supertest(app).get("/users/123456789123/metrics");

    expect(response.status).toBe(200);
  });
});

describe("GET /users/:id/balance", () => {
  let getBalanceStub;

  beforeEach(() => {
    getBalanceStub = sinon.stub(metrics, "getBalance");
  });

  afterEach(() => {
    getBalanceStub.restore();
  });

  it("Should return balance", async () => {
    getBalanceStub.resolves({
      balance: 52,
    });

    const response = await supertest(app).get(
      "/users/123456789123/balance?detailled=true"
    );

    expect(response.status).toBe(200);
  });
});
