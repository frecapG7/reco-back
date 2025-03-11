const sinon = require("sinon");
const supertest = require("supertest");

const usersApiService = require("../../service/api/users/usersApiService");

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
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      };
      next();
    };
  });

app.use("/users", require("./users"));
app.use(handleError);

describe("GET /users/:name", () => {
  let getByNameStub;

  beforeEach(() => {
    getByNameStub = sinon.stub(usersApiService, "getByName");
  });
  afterEach(() => {
    getByNameStub.restore();
  });

  it("should return user", async () => {
    getByNameStub.resolves(sinon.mock());

    const response = await supertest(app).get("/users/toto");

    expect(response.status).toBe(200);
  });
});

describe("PUT /users/:id", () => {
  let updateUserStub;

  beforeEach(() => {
    updateUserStub = sinon.stub(usersApiService, "updateUser");
  });
  afterEach(() => {
    updateUserStub.restore();
  });

  it("should return updated user", async () => {
    updateUserStub.resolves({
      id: 1,
    });

    const response = await supertest(app)
      .put("/users/65df6cc757b41fec4d7c3055")
      .send({
        email: "test",
        name: "test",
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(1);
  });
});

describe("PUT /users/:id/password", () => {
  let updatePasswordStub;

  beforeEach(() => {
    updatePasswordStub = sinon.stub(usersApiService, "updatePassword");
  });
  afterEach(() => {
    updatePasswordStub.reset();
  });

  it("should update user password", async () => {
    updatePasswordStub.resolves({
      id: 1,
    });

    const response = await supertest(app)
      .put("/users/65df6cc757b41fec4d7c3055/password")
      .send({
        newPassword: "56464zad",
        oldPassword: "test",
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(1);

    sinon.assert.calledOnce(updatePasswordStub);
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

    const response = await supertest(app).get(
      "/users/65df6cc757b41fec4d7c3055/settings"
    );

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
      .patch("/users/65df6cc757b41fec4d7c3055/settings")
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
      .delete("/users/65df6cc757b41fec4d7c3055/settings")
      .send();

    expect(response.status).toBe(200);
  });
});

describe("GET /users/:id/recommendations", () => {
  let getRecommendationsStub;

  beforeEach(() => {
    getRecommendationsStub = sinon.stub(usersApiService, "getRecommendations");
  });

  afterEach(() => {
    getRecommendationsStub.restore();
  });

  it("Should return recommendations", async () => {
    getRecommendationsStub.resolves({
      pagination: {},
      results: [
        {
          id: 1,
        },
      ],
    });

    const response = await supertest(app).get(
      "/users/123456789123/recommendations"
    );

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
