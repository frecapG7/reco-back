const sinon = require("sinon");
const supertest = require("supertest");
const purchasesApiService = require("../../service/api/users/purchasesApiService");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use("/users/:userId/purchases", require("./purchases"));

describe("GET /users/:userId/purchases", () => {
  it("should return 200 and call purchase.getPurchases", async () => {
    const getPurchasesStub = sinon.stub(purchasesApiService, "getPurchases").resolves();
    await supertest(app).get("/users/1/purchases").expect(200);
    sinon.assert.calledOnce(getPurchasesStub);
    getPurchasesStub.restore();
  });
});

describe("GET /users/:userId/purchases/:purchaseId", () => {
  it("should return 200 and call purchase.getPurchase", async () => {
    const getPurchaseStub = sinon.stub(purchasesApiService, "getPurchase").resolves();
    await supertest(app).get("/users/1/purchases/1").expect(200);
    sinon.assert.calledOnce(getPurchaseStub);
    getPurchaseStub.restore();
  });
});

describe("POST /users/:userId/purchases/:purchaseId/redeem", () => {
  it("should return 204 and call purchase.redeemPurchase", async () => {
    const redeemPurchaseStub = sinon
      .stub(purchasesApiService, "redeemPurchase")
      .resolves();
    await supertest(app).post("/users/1/purchases/1/redeem").expect(204);
    sinon.assert.calledOnce(redeemPurchaseStub);
    redeemPurchaseStub.restore();
  });
});

describe("POST /users/:userId/purchases", () => {
  it("should return 201 and call purchase.createPurchase", async () => {
    const createPurchaseStub = sinon
      .stub(purchasesApiService, "createPurchase")
      .resolves();
    await supertest(app).post("/users/1/purchases").expect(201);
    sinon.assert.calledOnce(createPurchaseStub);
    createPurchaseStub.restore();
  });
});
