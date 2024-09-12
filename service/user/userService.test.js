const sinon = require("sinon");
const User = require("../../model/User");
const userService = require("./userService");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const mongoose = require("mongoose");
const tokenValidation = require("../validation/tokenValidation");
const tokenService = require("../token/tokenService");
const userValidation = require("../validation/userValidation");
const historyService = require("./usersHistoryService");

describe("Test getUser", () => {
  let userFindByIdStub;
  let getStatsStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
    getStatsStub = sinon.stub(historyService, "getStats");
  });
  afterEach(() => {
    userFindByIdStub.restore();
    getStatsStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdStub.resolves(null);

    await expect(userService.getUser({ id: "123" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should return user", async () => {
    const expected = new User({
      _id: "12345",
      name: "test",
      title: "test",
      avatar: "test",
      balance: 0,
      created: new Date(),
      settings: {
        privacy: {
          privateRequests: false,
          privateRecommendations: false,
          privatePurchases: true,
        },
      },
    });
    userFindByIdStub.resolves(expected);
    getStatsStub.returns({
      requestsCount: 4,
      recommendationsCount: 2,
    });

    const result = await userService.getUser({ id: "123" });
    expect(userFindByIdStub.calledWith("123")).toEqual(true);
    expect(result.statistics.requestsCount).toEqual(4);
    expect(result.statistics.recommendationsCount).toEqual(2);
    expect(result.privacy.showRequests).toEqual(true);
    expect(result.privacy.showRecommendations).toEqual(true);
    expect(result.privacy.showPurchaseHistory).toEqual(false);
  });
});

describe("Test createUser", () => {
  let validateEmailStub;
  let validateUsernameStub;
  let validateTokenStub;
  let mongooseStub;
  let getTokenStub;
  let flagAsUsedStub;
  let userSaveStub;

  beforeEach(() => {
    validateEmailStub = sinon.stub(userValidation, "validateEmailUnicity");
    validateUsernameStub = sinon.stub(
      userValidation,
      "validateUsernameUnicity"
    );
    validateTokenStub = sinon.stub(tokenValidation, "validateToken");
    mongooseStub = sinon.stub(mongoose, "startSession");
    getTokenStub = sinon.stub(tokenService, "getToken");
    flagAsUsedStub = sinon.stub(tokenService, "flagAsUsed");
    userSaveStub = sinon.stub(User.prototype, "save");
  });
  afterEach(() => {
    validateEmailStub.restore();
    validateUsernameStub.restore();
    validateTokenStub.restore();
    mongooseStub.restore();
    getTokenStub.restore();
    flagAsUsedStub.restore();
    userSaveStub.restore();
  });

  it("Should reject on invalid token", async () => {
    validateEmailStub.resolves();
    validateUsernameStub.resolves();
    validateTokenStub.resolves();

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    getTokenStub
      .withArgs("3354az")
      .resolves({ _id: "3354az", type: "INVALID" });

    await expect(
      userService.createUser(
        {
          name: "test",
          email: "test",
          password: "test",
        },
        "3354az"
      )
    ).rejects.toThrow(ForbiddenError);

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should rollback transaction", async () => {
    validateEmailStub.resolves();
    validateUsernameStub.resolves();
    validateTokenStub.resolves();

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    getTokenStub.resolves({ _id: "3354az", type: "ACCOUNT_CREATION" });
    flagAsUsedStub.withArgs({ _id: "3354az" }).resolves();

    userSaveStub.throws(new Error("test"));

    await expect(
      userService.createUser(
        {
          name: "test",
          email: "test",
          password: "test",
        },
        "3354az"
      )
    ).rejects.toThrow(Error);

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should test happy path", async () => {
    validateEmailStub.resolves();
    validateUsernameStub.resolves();
    validateTokenStub.resolves();

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    getTokenStub.resolves({ _id: "3354az", type: "ACCOUNT_CREATION" });
    flagAsUsedStub.withArgs({ _id: "3354az" }).resolves();

    userSaveStub.resolves({ _id: "123" });

    const result = await userService.createUser(
      {
        name: "test",
        email: "test",
        password: "test",
      },
      "3354az"
    );

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();

    expect(result).toEqual({
      _id: "123",
    });
  });
});

describe("Test updateUser", () => {
  let userFindByIdAndUpdateStub;

  beforeEach(() => {
    userFindByIdAndUpdateStub = sinon.stub(User, "findByIdAndUpdate");
  });
  afterEach(() => {
    userFindByIdAndUpdateStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdAndUpdateStub.resolves(null);

    await expect(userService.updateUser("123", {})).rejects.toThrow(
      NotFoundError
    );
  });
  it("Should test happy path", async () => {
    const expected = new User();
    userFindByIdAndUpdateStub.resolves(expected);

    const result = await expect(
      userService.updateUser("123", {
        name: "test",
        email: "test",
      })
    );

    expect(
      userFindByIdAndUpdateStub.calledWith(
        "123",
        {
          name: "test",
          email: "test",
        },
        { new: true }
      )
    );

    // expect(result).toEqual(expected);
  });
});

describe("Test getLastRequests", () => {
  let userFindByIdStub;
  let getRequestsHistoryStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
    getRequestsHistoryStub = sinon.stub(historyService, "getRequestsHistory");
  });

  afterEach(() => {
    userFindByIdStub.restore();
    getRequestsHistoryStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdStub.resolves(null);

    await expect(userService.getLastRequests({ id: "123" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should throw a forbidden error", async () => {
    const user = new User({
      settings: {
        privacy: {
          privateRequests: true,
        },
      },
    });
    userFindByIdStub.resolves(user);

    await expect(userService.getLastRequests({ id: "123" })).rejects.toThrow(
      ForbiddenError
    );
  });

  it("Should return last requests", async () => {
    const user = new User({
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);
    getRequestsHistoryStub.returns([]);

    const result = await userService.getLastRequests({ id: "123" });

    expect(result).toEqual([]);
  });
});

describe("Test getLastRecommendations", () => {
  let userFindByIdStub;
  let getRecommendationsHistoryStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
    getRecommendationsHistoryStub = sinon.stub(
      historyService,
      "getRecommendationsHistory"
    );
  });

  afterEach(() => {
    userFindByIdStub.restore();
    getRecommendationsHistoryStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdStub.resolves(null);

    await expect(
      userService.getLastRecommendations({ id: "123" })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should throw a forbidden error", async () => {
    const user = new User({
      settings: {
        privacy: {
          privateRequests: true,
        },
      },
    });
    userFindByIdStub.resolves(user);

    await expect(
      userService.getLastRecommendations({ id: "123" })
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should return last recommendations", async () => {
    const user = new User({
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);
    getRecommendationsHistoryStub.returns([]);

    const result = await userService.getLastRecommendations({ id: "123" });

    expect(result).toEqual([]);
  });
});
