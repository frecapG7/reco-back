const sinon = require("sinon");
const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const User = require("../../../model/User");

const historyService = require("../../user/usersHistoryService");

const { getUser, getLastRequests, getLastRecommendations } = require("./users");

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

    await expect(getUser({ id: "123" })).rejects.toThrow(NotFoundError);
  });

  it("Should return user when anonymous", async () => {
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

    const result = await getUser({ id: "123" });
    expect(userFindByIdStub.calledWith("123")).toEqual(true);
    expect(result.statistics.requestsCount).toEqual(4);
    expect(result.statistics.recommendationsCount).toEqual(2);
    expect(result.privacy.showRequests).toEqual(true);
    expect(result.privacy.showRecommendations).toEqual(true);
    expect(result.privacy.showPurchaseHistory).toEqual(false);
  });
  it("Should return user when self", async () => {
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

    const result = await getUser({
      id: "123",
      authenticatedUser: expected,
    });
    expect(userFindByIdStub.calledWith("123")).toEqual(true);
    expect(result.statistics.requestsCount).toEqual(4);
    expect(result.statistics.recommendationsCount).toEqual(2);
    expect(result.privacy.showRequests).toEqual(true);
    expect(result.privacy.showRecommendations).toEqual(true);
    expect(result.privacy.showPurchaseHistory).toEqual(true);
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

    await expect(getLastRequests({ id: "123" })).rejects.toThrow(NotFoundError);
  });

  it("Should throw a forbidden error", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: true,
        },
      },
    });
    userFindByIdStub.resolves(user);

    await expect(getLastRequests({ id: "123" })).rejects.toThrow(
      ForbiddenError
    );
  });

  it("Should return last requests", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);
    getRequestsHistoryStub.returns([]);

    const result = await getLastRequests({ id: "123" });

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

    await expect(getLastRecommendations({ id: "123" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should throw a forbidden error", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: true,
        },
      },
    });
    userFindByIdStub.resolves(user);

    await expect(getLastRecommendations({ id: "123" })).rejects.toThrow(
      ForbiddenError
    );
  });

  it("Should return last recommendations", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);
    getRecommendationsHistoryStub.returns([]);

    const result = await getLastRecommendations({ id: "123" });

    expect(result).toEqual([]);
  });
});
