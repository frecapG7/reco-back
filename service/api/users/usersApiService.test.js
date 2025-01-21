const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const userService = require("../../user/userService");

const sinon = require("sinon");
const { signup, updateUser } = require("./usersApiService");

describe("Should test signup function", () => {
  let validateTokenStub;
  let getTokenStub;
  let createUserStub;

  beforeEach(() => {
    validateTokenStub = sinon.stub(tokenValidation, "validateToken");
    getTokenStub = sinon.stub(tokenService, "getToken");
    createUserStub = sinon.stub(userService, "createUser");
  });

  afterEach(() => {
    validateTokenStub.restore();
    getTokenStub.restore();
    createUserStub.restore();
  });

  it("Should throw an invalid token error", async () => {
    validateTokenStub.resolves();

    getTokenStub
      .withArgs("3354az")
      .resolves({ _id: "3354az", type: "INVALID" });

    await expect(
      signup({
        query: {
          token: "3354az",
        },
      })
    ).rejects.toThrow("Invalid token");
  });

  it("Should return a user", async () => {
    validateTokenStub.resolves();

    const mockToken = {
      _id: "3354az",
      type: "ACCOUNT_CREATION",
      save: () => sinon.stub().resolvesThis(),
    };

    getTokenStub.withArgs("3354az").resolves(mockToken);

    createUserStub
      .withArgs({
        name: "John Doe",
        password: "password",
        confirmPassword: "password",
      })
      .resolves({
        save: () => sinon.stub().resolvesThis(),
      });

    const result = await signup({
      query: {
        token: "3354az",
      },
      body: {
        name: "John Doe",
        password: "password",
        confirmPassword: "password",
      },
    });
    expect(result).toBeDefined();
    expect(mockToken.used).toBe(true);
  });
});

describe("Should test updateUser function", () => {
  let getUserStub;
  let updateUserStub;

  beforeEach(() => {
    getUserStub = sinon.stub(userService, "getUser");
    updateUserStub = sinon.stub(userService, "updateUser");
  });

  afterEach(() => {
    getUserStub.restore();
    updateUserStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    await expect(
      updateUser({ params: { id: "123" }, user: { role: "USER" } })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should update user", async () => {
    const mockUser = {
      save: () => sinon.stub().resolvesThis(),
    };

    getUserStub.withArgs("123").resolves(mockUser);
    updateUserStub.resolves();

    const result = await updateUser({
      params: { id: "123" },
      body: { name: "John Doe" },
      user: { role: "ADMIN" },
    });

    expect(result).toBeDefined();

    sinon.assert.calledWith(updateUserStub, mockUser, { name: "John Doe" });
  });
});
