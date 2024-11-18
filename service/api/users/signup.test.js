const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const mongoose = require("mongoose");
const userService = require("../../user/userService");
const sinon = require("sinon");
const { signup } = require("./signup");

describe("Test signup", () => {
  let validateTokenStub;
  let mongooseStub;
  let getTokenStub;
  let flagAsUsedStub;
  let createUserStub;

  beforeEach(() => {
    validateTokenStub = sinon.stub(tokenValidation, "validateToken");
    mongooseStub = sinon.stub(mongoose, "startSession");
    getTokenStub = sinon.stub(tokenService, "getToken");
    flagAsUsedStub = sinon.stub(tokenService, "flagAsUsed");
    createUserStub = sinon.stub(userService, "createUser");
  });
  afterEach(() => {
    validateTokenStub.restore();
    mongooseStub.restore();
    getTokenStub.restore();
    flagAsUsedStub.restore();
    createUserStub.restore();
  });

  it("Should reject on invalid token", async () => {
    validateTokenStub.resolves();
    getTokenStub
      .withArgs("3354az")
      .resolves({ _id: "3354az", type: "INVALID" });

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);
    await expect(
      signup({
        data: {
          token: "3354az",
        },
      })
    ).rejects.toThrow("Invalid token");

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should rollback transaction on error", async () => {
    validateTokenStub.resolves();
    getTokenStub
      .withArgs("3354az")
      .resolves({ _id: "3354az", type: "ACCOUNT_CREATION" });
    createUserStub.rejects(new Error("Test error"));

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    await expect(
      signup({
        data: {
          token: "3354az",
        },
      })
    ).rejects.toThrow("Test error");
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should test happy path", async () => {
    validateTokenStub.resolves();
    getTokenStub
      .withArgs("3354az")
      .resolves({ _id: "3354az", type: "ACCOUNT_CREATION" });
    createUserStub.resolves({ _id: "3354az" });

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongooseStub.resolves(sessionStub);

    const result = await signup({
      data: {
        token: "3354az",
        name: "test",
        password: "test",
        confirmPassword: "test",
        icon_id: "test",
      },
    });

    expect(result).toEqual({ _id: "3354az" });
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
  });
});
