const User = require("../../model/User");
const Request = require("../../model/Request");
const Recommendation = require("../../model/Recommendation");
const sinon = require("sinon");

const userAdminService = require("./usersAdminService");
const { NotFoundError } = require("../../errors/error");
const { inRange } = require("lodash");

describe("Test search", () => {
  let userStub;
  let countDocumentsStub;

  beforeEach(() => {
    userStub = sinon.stub(User, "find");
    countDocumentsStub = sinon.stub(User, "countDocuments");
  });
  afterEach(() => {
    userStub.restore();
    countDocumentsStub.restore();
  });

  it("Should return happy path", async () => {
    countDocumentsStub.returns(10);

    const expected = new User();
    userStub.returns({
      skip: sinon
        .stub()
        .withArgs(0)
        .returns({
          limit: sinon
            .stub()
            .withArgs(1)
            .returns({
              exec: sinon.stub().returns([expected]),
            }),
        }),
    });

    const result = await userAdminService.search({
      filters: {
        name: "John",
      },
      pageSize: 1,
      pageNumber: 1,
      authenticatedUser: { id: 1, role: "ADMIN" },
    });

    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(10);
    expect(result.pagination.totalResults).toEqual(10);

    expect(result.results.length).toEqual(1);
  });
});

describe("Test getUserDetails", () => {
  let userStub;
  let requestsCountStub;
  let recommendationsCountStub;

  beforeEach(() => {
    userStub = sinon.stub(User, "findById");
    requestsCountStub = sinon.stub(Request, "countDocuments");
    recommendationsCountStub = sinon.stub(Recommendation, "countDocuments");
  });
  afterEach(() => {
    userStub.restore();
    requestsCountStub.restore();
    recommendationsCountStub.restore();
  });

  it("Should throw not found error", async () => {
    userStub.returns(null);

    await expect(
      userAdminService.getUserDetails({
        userId: 52,
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return user", async () => {
    const expected = new User({
      balance: 10,
    });
    userStub.returns(expected);

    requestsCountStub.returns(10);
    recommendationsCountStub.returns(10);

    const result = await userAdminService.getUserDetails({
      userId: 52,
      authenticatedUser: { role: "ADMIN" },
    });

    expect(result).toBeDefined();
    expect(result.stats).toBeDefined();
    expect(result.stats.requestsCount).toEqual(10);
    expect(result.stats.recommendationsCount).toEqual(10);
    expect(result.stats.balance).toEqual(10);
  });
});

describe("Test getLastRequests", () => {
  let userStub;
  let requestStub;

  beforeEach(() => {
    userStub = sinon.stub(User, "findById");
    requestStub = sinon.stub(Request, "find");
  });
  afterEach(() => {
    userStub.restore();
    requestStub.restore();
  });

  it("Should throw not found error", async () => {
    userStub.returns(null);

    await expect(
      userAdminService.getLastRequests({
        id: 52,
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return last requests", async () => {
    const expected = new User();
    userStub.returns(expected);

    const request1 = new Request();
    const request2 = new Request();
    requestStub.returns({
      sort: sinon
        .stub()
        .withArgs({ created_at: -1 })
        .returns({
          limit: sinon
            .stub()
            .withArgs(5)
            .returns({
              exec: sinon.stub().returns([request1, request2]),
            }),
        }),
    });

    const result = await userAdminService.getLastRequests({
      id: 52,
      authenticatedUser: { role: "ADMIN" },
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(2);
  });
});

describe("Test getLastRecommendations", () => {
  let userStub;
  let recommendationStub;

  beforeEach(() => {
    userStub = sinon.stub(User, "findById");
    recommendationStub = sinon.stub(Recommendation, "find");
  });
  afterEach(() => {
    userStub.restore();
    recommendationStub.restore();
  });

  it("Should throw not found error", async () => {
    userStub.returns(null);

    await expect(
      userAdminService.getLastRequests({
        id: 52,
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return last recommendation", async () => {
    const expected = new User();
    userStub.returns(expected);

    const recommendation1 = new Recommendation();
    const recommendation2 = new Recommendation();

    recommendationStub.returns({
      sort: sinon
        .stub()
        .withArgs({ created_at: -1 })
        .returns({
          limit: sinon
            .stub()
            .withArgs(5)
            .returns({
              exec: sinon.stub().returns([recommendation1, recommendation2]),
            }),
        }),
    });

    const result = await userAdminService.getLastRecommendations({
      id: 52,
      authenticatedUser: { role: "ADMIN" },
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(2);
  });
});
