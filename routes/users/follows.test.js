const sinon = require("sinon");
const supertest = require("supertest");
const followService = require("../../service/api/users/follows");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use("/users/:userId/follows", require("./follows"));

describe("POST /users/id/follows", () => {
  let postFollowStub;
  beforeEach(() => {
    postFollowStub = sinon.stub(followService, "postFollow");
  });

  afterEach(() => {
    postFollowStub.restore();
  });

  it("Should Post follow", async () => {
    const response = await supertest(app).post("/users/1/follows").send({
      userId: "598",
    });

    expect(response.status).toBe(200);

    sinon.assert.calledOnce(postFollowStub);
    sinon.assert.calledWith(postFollowStub, {
      id: "1",
      body: {
        userId: "598",
      },
      authenticatedUser: undefined,
    });
  });
});

describe("GET /users/id/follows", () => {
  let getFollowsStub;

  beforeEach(() => {
    getFollowsStub = sinon.stub(followService, "getFollows");
  });
  afterEach(() => {
    getFollowsStub.restore();
  });

  it("Should get follows", async () => {
    getFollowsStub.resolves({
      pagination: {},
      results: [
        {
          id: 1,
        },
      ],
    });

    const response = await supertest(app).get("/users/1/follows?pageNumber=1");

    expect(response.status).toBe(200);

    sinon.assert.calledOnce(getFollowsStub);
    sinon.assert.calledWith(getFollowsStub, {
      id: "1",
      pageNumber: 1,
      pageSize: 10,
      authenticatedUser: undefined,
    });
  });
});

describe("DELETE /users/id/follows/id", () => {
  let removeFollowStub;

  beforeEach(() => {
    removeFollowStub = sinon.stub(followService, "removeFollow");
  });

  afterEach(() => {
    removeFollowStub.restore();
  });

  it("Should remove follow ", async () => {
    const response = await supertest(app).delete("/users/1/follows/598").send({
      userId: "598",
    });

    expect(response.status).toBe(200);

    sinon.assert.calledOnce(removeFollowStub);
    sinon.assert.calledWith(removeFollowStub, {
      id: "1",
      body: {
        userId: "598",
      },
      authenticatedUser: undefined,
    });
  });
});
