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

describe("POST /admin/market/items/icons", () => {
  let createItemStub;
  beforeEach(() => {
    createItemStub = sinon.stub(marketAdminService, "createIconItem");
  });
  afterEach(() => {
    createItemStub.restore();
  });

  it("Should create specific item", async () => {
    const expected = createItemStub.returns({});

    const response = await supertest(app)
      .post("/admin/market/items/icons")
      .send({});
    expect(response.status).toBe(201);
  });
});

describe("POST /admin/market/items/consumables", () => {
  let createItemStub;
  beforeEach(() => {
    createItemStub = sinon.stub(marketAdminService, "createConsumableItem");
  });
  afterEach(() => {
    createItemStub.restore();
  });

  it("Should create specific item", async () => {
    const expected = createItemStub.returns({});

    const response = await supertest(app)
      .post("/admin/market/items/consumables")
      .send({});
    expect(response.status).toBe(201);

    expect(expected.calledOnce).toBe(true);
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

describe("PUT /admin/market/items/id", () => {
  let updateItemStub;
  beforeEach(() => {
    updateItemStub = sinon.stub(marketAdminService, "updateItem");
  });
  afterEach(() => {
    updateItemStub.restore();
  });

  it("Should create specific item", async () => {
    const expected = updateItemStub.returns({});

    const response = await supertest(app)
      .put("/admin/market/items/123")
      .send({});
    expect(response.status).toBe(200);
  });
});
