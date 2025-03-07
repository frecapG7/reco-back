const sinon = require("sinon");
const supertest = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const marketAdminApiService = require("../../../service/api/admin/marketAdminApiService");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const adminProductsRoute = require("./adminProducts");
app.use("/admin/market/products", adminProductsRoute);

describe("GET /admin/market/product/:id", () => {
  let getStub;
  beforeEach(() => {
    getStub = sinon.stub(marketAdminApiService, "get");
  });
  afterEach(() => {
    getStub.restore();
  });
  it("Should return specific item", async () => {
    getStub.returns({
      id: "expected",
    });

    const response = await supertest(app).get(
      "/admin/market/products/1332Zzet"
    );
    expect(response.status).toBe(200);
  });
});

describe("PUT /admin/market/products/id", () => {
  let updateItemStub;
  beforeEach(() => {
    updateItemStub = sinon.stub(marketAdminApiService, "update");
  });
  afterEach(() => {
    updateItemStub.restore();
  });

  it("Should update an item", async () => {
    const expected = updateItemStub.returns({});

    const response = await supertest(app)
      .put("/admin/market/products/123")
      .send({});
    expect(response.status).toBe(200);
  });
});

describe("POST /admin/market/products", () => {
  let createStub;
  beforeEach(() => {
    createStub = sinon.stub(marketAdminApiService, "create");
  });
  afterEach(() => {
    createStub.restore();
  });

  it("Should create specific item", async () => {
    const expected = createStub.returns({});

    const response = await supertest(app)
      .post("/admin/market/products")
      .send({});
    expect(response.status).toBe(201);
  });
});
