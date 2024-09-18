const sinon = require("sinon");
const supertest = require("supertest");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const othersRoutes = require("./others");
app.use("/stores/others", othersRoutes);

const consumableStoreService = require("../../service/api/stores/consumableStoreService");

describe("POST /others/invitations/buy", () => {
  it("should return 201", async () => {
    sinon.stub(consumableStoreService, "buyInvitation").resolves({
      name: "Invitation",
      price: 10,
    });

    const response = await supertest(app)
      .post("/stores/others/invitations/buy")
      .send({});
    expect(response.statusCode).toBe(201);
  });
});

describe("POST /others/gifts/buy", () => {
  it("should return 201", async () => {
    sinon.stub(consumableStoreService, "buyGift").resolves({
      name: "Gift",
      price: 20,
    });
    const response = await supertest(app)
      .post("/stores/others/gifts/buy")
      .send({});
    expect(response.statusCode).toBe(201);
  });
});
