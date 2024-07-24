const sinon = require("sinon");
const supertest = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const marketAdminService = require("../../../service/admin/marketAdminService");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const itemsRoutes = require("./items");
app.use("/admin/market/items", itemsRoutes);

describe("POST /admin/market/items", () => {
  let createItemStub;
  beforeEach(() => {
    createItemStub = sinon.stub(marketAdminService, "createMarketItem");
  });
  afterEach(() => {
    createItemStub.restore();
  });

  it("Should create specific item", async () => {
    const expected = createItemStub.returns({});

    const response = await supertest(app).post("/admin/market/items").send({});
    expect(response.status).toBe(201);
  });
});

describe("GET /admin/market/items/:id", () => {
  let getItemStub;
  beforeEach(() => {
    getItemStub = sinon.stub(marketAdminService, "getMarketItem");
  });
  afterEach(() => {
    getItemStub.restore();
  });
  it("Should return specific item", async () => {
    getItemStub.returns({
      id: "expected",
    });

    const response = await supertest(app).get("/admin/market/items/1332Zzet");
    expect(response.status).toBe(200);
  });
});
