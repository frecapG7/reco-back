const sinon = require("sinon");
const supertest = require("supertest");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const passport = require("../../auth");
sinon
  .stub(passport, "authenticate")
  .callsFake((strategy, options, callback) => {
    return (req, res, next) => {
      req.user = {
        _id: "123",
      };
      next();
    };
  });

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


