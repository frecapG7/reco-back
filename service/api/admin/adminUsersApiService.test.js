const { verifyAdmin } = require("../../validation/privilegeValidation");
const userService = require("../../user/userService");
const { get, search } = require("./adminUsersApiService");
const sinon = require("sinon");

describe("Should validate search function", () => {
  let searchStub;

  beforeEach(() => {
    searchStub = sinon.stub(userService, "paginatedSearch");
  });
  afterEach(() => {
    searchStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(search({ query: {} })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return paginated search results", async () => {
    const expected = sinon.mock();

    searchStub.returns(expected);

    const result = await search({
      query: {},
      user: { id: "123", role: "ADMIN" },
    });
    expect(result).toBe(expected);
  });
});

describe("Should validate get function", () => {
  let getUserStub;

  beforeEach(() => {
    getUserStub = sinon.stub(userService, "getUser");
  });
  afterEach(() => {
    getUserStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(get({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );

    it("Should return user", async () => {
      const expected = sinon.mock();
      getUserStub.returns(expected);
      const result = await get({
        params: { id: "123" },
        user: { id: "123", role: "ADMIN" },
      });

      expect(result).toBe(expected);
    });
  });
});
