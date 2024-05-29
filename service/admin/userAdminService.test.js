const User = require("../../model/User");
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
    userStub.returns(expected);

    const result = await userAdminService.search(10, 1, {});

    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.totalResults).toEqual(10);

    expect(result.results).toEqual([expected]);
  });
});

describe("Test getUser", () => {
  let userStub;

  beforeEach(() => {
    userStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    userStub.restore();
  });

  it("Should throw not found error", async () => {
    userStub.returns(null);

    await expect(userAdminService.getUser(52)).rejects.toThrow(NotFoundError);
  });

  it("Should return user", async () => {
    const expected = new User();
    userStub.returns(expected);

    const result = await userAdminService.getUser(52);

    expect(result).toBeDefined();
  });
});
