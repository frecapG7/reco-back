const sinon = require("sinon");
const supertest = require("supertest");

const User = require("../../model/User");
const signup = require("../../service/api/users/signup");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(express.json());

const signupRoutes = require("./signup");
app.use("/users/signup", signupRoutes);

describe("POST /signup", () => {
  let signupStub;
  beforeEach(() => {
    signupStub = sinon.stub(signup, "signup");
  });
  afterEach(() => {
    signupStub.restore();
  });

  it("should return 201", async () => {
    signupStub.resolves(
      new User({
        email: "test",
        name: "test",
      })
    );

    const response = await supertest(app).post("/users/signup").send({
      name: "test",
      password: "test",
      token: "123",
    });

    expect(response.status).toBe(201);

    sinon.assert.calledWith(signupStub, {
      name: "test",
      password: "test",
      token: "123",
    });
  });
});

describe("GET /avatars", () => {
  let getAvatarsStub;

  beforeEach(() => {
    getAvatarsStub = sinon.stub(signup, "getAvatars");
  });

  afterEach(() => {
    getAvatarsStub.restore();
  });

  it("should return 200", async () => {
    getAvatarsStub.resolves([{ name: "avatar1" }, { name: "avatar2" }]);

    const response = await supertest(app).get("/users/signup/avatars");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ name: "avatar1" }, { name: "avatar2" }]);
  });
});
