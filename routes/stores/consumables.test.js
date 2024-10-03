const sinon = require("sinon");
const supertest = require("supertest");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const consumableRoutes = require("./consumables");
app.use("/stores/consumables", consumableRoutes);

const consumableStoreService = require("../../service/api/stores/consumableStoreService");

describe("GET /stores/consumables", () => {
  const getConsumableItemsStub = sinon.stub(
    consumableStoreService,
    "getConsumableItems"
  );

  beforeEach(() => {
    getConsumableItemsStub.reset();
  });

  it("Should return items", async () => {
    getConsumableItemsStub.returns({
      id: "expected",
    });

    const response = await supertest(app).get("/stores/consumables");
    expect(response.status).toBe(200);
  });
});

describe("POST /stores/consumables/123/buy", () => {
  let buyStub;

  beforeEach(() => {
    buyStub = sinon.stub(consumableStoreService, "buyConsumable");
  });

  afterEach(() => {
    buyStub.restore();
  });
  it("Should buy ConsumableItem", async () => {
    buyStub.returns({
      _id: "123",
      label: "Krishna the Wise",
      price: 45,
    });

    const response = await supertest(app).post("/stores/consumables/123/buy");
    expect(response.status).toBe(201);
  });
});