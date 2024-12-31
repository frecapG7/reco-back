const sinon = require("sinon");
const supertest = require("supertest");
const iconStoreService = require("../../service/api/stores/iconStoreService");

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

const iconsRoutes = require("./icons");

app.use("/stores/icons", iconsRoutes);

describe("GET /stores/icons", () => {
  const getRecentsIconStub = sinon.stub(iconStoreService, "getRecentsIcon");

  beforeEach(() => {
    getRecentsIconStub.reset();
  });

  it("Should return specific item", async () => {
    getRecentsIconStub.returns({
      id: "expected",
    });

    const response = await supertest(app).get("/stores/icons");
    expect(response.status).toBe(200);
  });
});
