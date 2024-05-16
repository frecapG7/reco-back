const sinon = require("sinon");
const supertest = require("supertest");
const recommendationService = require("../../service/request/recommendationService");

const express = require("express");
const bodyParser = require("body-parser");
const handleError = require("../../middleware/errorMiddleware");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const passport = require("../../auth");

// Mock authenticateToken
// Order must prevail
const passportStub = sinon
  .stub(passport, "authenticate")
  .callsFake((strategy, options, callback) => {
    return (req, res, next) => {
      req.user = {
        _id: "123",
      };
      next();
    };
  });
const recommendation = require("./recommendations");

app.use("/requests/:requestId/recommendations", recommendation);
app.use(handleError);

describe("GET /requests/:requestId/recommendations", () => {
  let recommendationServiceStub;

  beforeEach(() => {
    recommendationServiceStub = sinon.stub(
      recommendationService,
      "getRecommendations"
    );
  });
  afterEach(() => {
    recommendationServiceStub.restore();
  });

  it("should return recommendations", async () => {
    recommendationServiceStub.withArgs("123", { _id: 123 }).resolves({
      items: [{ _id: 1 }],
    });
    const response = await supertest(app).get("/requests/123/recommendations");
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ items: [{ _id: 1 }] });
  });
});

describe("GET /request/:requestId/recommendations/:id", () => {
  let recommendationServiceStub;
  beforeEach(() => {
    recommendationServiceStub = sinon.stub(
      recommendationService,
      "getRecommendation"
    );
  });
  afterEach(() => {
    recommendationServiceStub.restore();
  });

  it("should return a recommendation", async () => {
    recommendationServiceStub.withArgs("1").resolves({
      id: 1,
      request_id: 1,
      user_id: 1,
      field1: "value1",
      field2: "value2",
      field3: "value3",
    });

    const response = await supertest(app).get(
      "/requests/123/recommendations/1"
    );
    expect(response.status).toEqual(200);
  });
});

describe("POST /requests/:requestId/recommendations", () => {
  let recommendationServiceStub;
  beforeEach(() => {
    recommendationServiceStub = sinon.stub(
      recommendationService,
      "createRecommendation"
    );
  });
  afterEach(() => {
    recommendationServiceStub.restore();
  });

  it("should return created recommendation", async () => {
    recommendationServiceStub
      .withArgs(
        "123",
        {
          field1: "value1",
          field2: "value2",
          field3: "value3",
        },
        { _id: "123" }
      )
      .resolves({
        id: 1,
        request_id: 1,
        user: { _id: "123" },
        field1: "value1",
        field2: "value2",
        field3: "value3",
      });

    const response = await supertest(app)
      .post("/requests/123/recommendations")
      .send({
        field1: "value1",
        field2: "value2",
        field3: "value3",
      });

    expect(response.status).toBe(201);
  });
});
