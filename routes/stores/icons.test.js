const sinon = require("sinon");
const supertest = require("supertest");
const marketService = require("../../service/market/marketService");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const iconsRoutes = require("./icons");
app.use("/stores/icons", iconsRoutes);

describe("GET /stores/icons", () => {
  const searchItemsStub = sinon.stub(marketService, "searchItems");

  beforeEach(() => {
    searchItemsStub.reset();
  });

  it("Should return specific item", async () => {
    searchItemsStub.returns({
      id: "expected",
    });

    const response = await supertest(app).get("/stores/icons/");
    expect(response.status).toBe(200);
  });
});
