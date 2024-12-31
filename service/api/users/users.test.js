const sinon = require("sinon");
const { NotFoundError, ForbiddenError } = require("../../../errors/error");
const User = require("../../../model/User");
const userService = require("../../user/userService");
const requestService = require("../../request/requestService");
const recommendationsService = require("../../recommendations/recommendationsService");

const historyService = require("../../user/usersHistoryService");

const {
  getUser,
  updateAvatar,
  getRequests,
  getRecommendations,
} = require("./users");

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
    expect(result.privacy.showRequests).toEqual(true);
    expect(result.privacy.showRecommendations).toEqual(true);
    expect(result.privacy.showPurchaseHistory).toEqual(true);
  });
});

describe("Test updateAvatar", () => {
  let getUserStub;

  beforeEach(() => {
    getUserStub = sinon.stub(userService, "getUser");
  });
  afterEach(() => {
    getUserStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    expect(updateAvatar({ id: "123", avatar: "test" })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should update avatar", async () => {
    const user = {
      _id: "123",
      avatar: "test",
      save: () => sinon.stub().resolvesThis(),
    };
    getUserStub.resolves(user);

    const result = await updateAvatar({
      id: "123",
      avatar: "test",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    // expect(result.avatar).toEqual("test");
  });
});

describe("Test getRequests", () => {
  let userFindByIdStub;
  let searchRequestsStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
    searchRequestsStub = sinon.stub(requestService, "search");
  });

  afterEach(() => {
    userFindByIdStub.restore();
    searchRequestsStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdStub.resolves(null);

    await expect(getRequests({ id: "123" })).rejects.toThrow(NotFoundError);
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

    await expect(getRequests({ id: "123" })).rejects.toThrow(ForbiddenError);
  });

  it("Should return requests with no args", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);
    searchRequestsStub.returns({
      pagination: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      results: [],
    });

    const results = await getRequests({
      id: "123",
      pageSize: 10,
      pageNumber: 1,
    });

    expect(results).toBeDefined();

    sinon.assert.calledWith(userFindByIdStub, "123");
    sinon.assert.calledWith(searchRequestsStub, {
      filters: {
        author: user,
      },
      pageSize: 10,
      pageNumber: 1,
    });
  });

  it("Should return requests with all args", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);
    searchRequestsStub.returns({
      pagination: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      results: [],
    });

    const results = await getRequests({
      id: "123",
      search: "test",
      type: "test",
      pageSize: 10,
      pageNumber: 1,
    });

    expect(results).toBeDefined();

    sinon.assert.calledWith(userFindByIdStub, "123");
    sinon.assert.calledWith(searchRequestsStub, {
      filters: {
        search: "test",
        requestType: "test",
        author: user,
      },
      pageSize: 10,
      pageNumber: 1,
    });
  });
});

describe("Test getRecommendations", () => {
  let userFindByIdStub;
  let searchRecommendationsStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
    searchRecommendationsStub = sinon.stub(
      recommendationsService,
      "searchRecommendations"
    );
  });

  afterEach(() => {
    userFindByIdStub.restore();
    searchRecommendationsStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdStub.resolves(null);

    await expect(getRecommendations({ id: "123" })).rejects.toThrow(
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

    await expect(getRecommendations({ id: "123" })).rejects.toThrow(
      ForbiddenError
    );
  });

  it("Should return recommendations with no args", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);

    searchRecommendationsStub.returns({
      pagination: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      results: [],
    });

    const result = await getRecommendations({
      id: "123",
    });

    expect(result).toBeDefined();
    expect(result.pagination.total).toEqual(0);

    sinon.assert.calledWith(userFindByIdStub, "123");
    sinon.assert.calledWith(searchRecommendationsStub, {
      requestType: undefined,
      search: undefined,
      showDuplicates: true,
      user,
      pageSize: NaN,
      pageNumber: NaN,
      sort: { created_at: -1 },
    });
  });
  it("Should return recommendations with query", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRequests: false,
        },
      },
    });
    userFindByIdStub.resolves(user);

    searchRecommendationsStub.returns({
      pagination: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      results: [],
    });

    const result = await getRecommendations({
      id: "123",
      query: {
        pageSize: 10,
        pageNumber: 1,
        search: "test",
        type: "test",
        pageNumber: 1,
        pageSize: 58,
        sort: "likes_asc",
      },
    });

    expect(result).toBeDefined();
    expect(result.pagination.total).toEqual(0);

    sinon.assert.calledWith(userFindByIdStub, "123");
    sinon.assert.calledWith(searchRecommendationsStub, {
      requestType: "test",
      search: "test",
      showDuplicates: true,
      user,
      pageSize: 58,
      pageNumber: 1,
      sort: { likes: 1 },
    });
  });
});
