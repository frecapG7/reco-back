const sinon = require("sinon");
const supertest = require("supertest");
const requestService = require("../../service/request/requestService");
const requestApiService = require("../../service/api/requests/requestsApiService");
const express = require("express");
const bodyParser = require("body-parser");
const handleError = require("../../middleware/errorMiddleware");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

// Mock authenticateToken
// Order must prevail
const passport = require("../../auth");
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

const requestRoutes = require("./requests");
app.use("/requests", requestRoutes);
app.use(handleError);

describe("GET /requests/:id", () => {
  let requestServiceStub;

  beforeEach(() => {
    requestServiceStub = sinon.stub(requestService, "getRequest");
  });
  afterEach(() => {
    requestServiceStub.restore();
  });

  it("should return a request", async () => {
    requestServiceStub.withArgs("123").resolves({
      id: 1,
      requestType: "BOOK",
      description: "SciFi recommended book",
      duration: "2D",
      status: "PENDING",
    });

    const response = await supertest(app).get("/requests/123");

    expect(response.status).toEqual(200);
  });
});

describe("POST /request", () => {
  let createRequestStub;

  beforeEach(() => {
    createRequestStub = sinon.stub(requestApiService, "createRequest");
  });
  afterEach(() => {
    createRequestStub.restore();
  });

  it("should return 200", async () => {
    createRequestStub
      .withArgs({
        body: {
          requestType: "BOOK",
          description: "SciFi recommended book",
        },
        user: {
          _id: "123",
        },
      })
      .resolves({
        id: "1",
        requestType: "BOOK",
        description: "SciFi recommended book",
      });

    const response = await supertest(app).post("/requests").send({
      requestType: "BOOK",
      description: "SciFi recommended book",
    });

    expect(response.status).toBe(201);
  });
});

describe("PUT /request", () => {
  let requestServiceStub;
  beforeEach(() => {
    requestServiceStub = sinon.stub(requestService, "updateRequest");
  });
  afterEach(() => {
    requestServiceStub.restore();
  });

  it("should return 200", async () => {
    requestServiceStub
      .withArgs(
        "123",
        {
          id: 1,
          requestType: "BOOK",
          description: "SciFi recommended book",
          duration: "2D",
        },
        {
          _id: "123",
        }
      )
      .resolves({
        id: 1,
        requestType: "BOOK",
        description: "SciFi recommended book",
        duration: "2D",
        status: "PENDING",
      });

    const response = await supertest(app).put("/requests/123").send({
      requestType: "BOOK",
      description: "SciFi recommended book",
      duration: "2D",
    });

    expect(response.status).toBe(200);
  });
});

describe("DELETE /requests/:id", () => {
  let requestServiceStub;
  beforeEach(() => {
    requestServiceStub = sinon.stub(requestService, "deleteRequest");
  });
  afterEach(() => {
    requestServiceStub.restore();
  });

  it("should return 200", async () => {
    requestServiceStub.withArgs("2", "123").resolves({});

    const response = await supertest(app).delete("/requests/2");

    expect(response.status).toEqual(204);
  });
});

describe("GET /requests", () => {
  let requestServiceStub;
  beforeEach(() => {
    requestServiceStub = sinon.stub(requestService, "search");
  });
  afterEach(() => {
    requestServiceStub.restore();
  });

  it("should return 200 with no params", async () => {
    requestServiceStub
      .withArgs({
        filters: {},
        pageSize: 10,
        pageNumber: 1,
      })
      .resolves({
        results: [],
        total: 0,
      });

    const response = await supertest(app).get("/requests");

    expect(response.status).toEqual(200);
    expect(response.body.results).toEqual([]);
    expect(response.body.total).toEqual(0);
  });

  it("should return 200 with params", async () => {
    requestServiceStub
      .withArgs({
        filters: {
          requestType: "BOOK",
          status: "OPEN",
          author: "123",
        },
        pageSize: 10,
        pageNumber: 1,
      })
      .resolves({
        results: [],
        total: 0,
      });

    const response = await supertest(app).get(
      "/requests?type=BOOK&status=OPEN&me=true"
    );

    expect(response.status).toEqual(200);
    expect(response.body.results).toEqual([]);
    expect(response.body.total).toEqual(0);
  });
});
