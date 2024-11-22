const User = require("../../model/User");
const Request = require("../../model/Request");
const Recommendation = require("../../model/Recommendation");
const sinon = require("sinon");

const userAdminService = require("./usersAdminService");
const { NotFoundError } = require("../../errors/error");

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
