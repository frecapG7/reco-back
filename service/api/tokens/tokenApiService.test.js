const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const Token = require("../../../model/Token");
const userService = require("../../user/userService");
const tokenService = require("../../token/tokenService");
const { createToken, getTokens, getUserTokens } = require("./tokensApiService");

const sinon = require("sinon");
describe("Test createToken", () => {
  let getUserStub;
  let purchaseFindOneStub;

  beforeEach(() => {
    getUserStub = sinon.stub(userService, "getUser");
    purchaseFindOneStub = sinon.stub(PurchaseItem, "findOne");
  });
  afterEach(() => {
    getUserStub.restore();
    purchaseFindOneStub.restore();
  });

  it("Should throw UnauthorizedError", async () => {
    await expect(
      createToken({
        body: {
          created_by: {
            id: "123",
          },
        },
        authenticatedUser: {},
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw ForbiddenError because no purchase item found", async () => {
    getUserStub.resolves({});

    purchaseFindOneStub.resolves(null);
    await expect(
      createToken({
        body: {
          created_by: {
            id: "123",
          },
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow("Not enough invitations");
  });

  it("Should create token", async () => {
    getUserStub.resolves({});

    purchaseFindOneStub.resolves({
      quantity: 1,
      save: () => sinon.stub().resolvesThis(),
    });
    const tokenSaveStub = sinon.stub(Token.prototype, "save");
    tokenSaveStub.resolves({});

    await createToken({
      body: {
        created_by: {
          id: "123",
        },
      },
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(tokenSaveStub.calledOnce).toBe(true);
  });
});

describe("Test getTokens", () => {
  let searchStub;

  beforeEach(() => {
    searchStub = sinon.stub(tokenService, "search");
  });
  afterEach(() => {
    searchStub.restore();
  });

  it("Should throw UnauthorizedError", async () => {
    await expect(
      getTokens({
        query: {},
        authenticatedUser: {},
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return tokens based on default values", async () => {
    searchStub.resolves({
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 1,
      },
      results: [],
    });

    const result = await getTokens({
      query: {},
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);

    sinon.assert.calledOnce(searchStub);
    sinon.assert.calledWith(searchStub, {
      filters: {},
      pageNumber: 1,
      pageSize: 10,
      populate: "created_by",
    });
  });

  it("Should return tokens based on query values", async () => {
    searchStub.resolves({
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 1,
      },
      results: [],
    });

    const result = await getTokens({
      query: {
        type: "invitation",
        created_by: "123",
        pageNumber: 2,
        pageSize: 5,
      },
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);

    sinon.assert.calledOnce(searchStub);
    sinon.assert.calledWith(searchStub, {
      filters: {
        type: "invitation",
        created_by: "123",
      },
      pageNumber: 2,
      pageSize: 5,
      populate: "created_by",
    });
  });
});

describe("Test getUserTokens", () => {
  let getUserStub;
  let searchStub;

  beforeEach(() => {
    getUserStub = sinon.stub(userService, "getUser");
    searchStub = sinon.stub(tokenService, "search");
  });
  afterEach(() => {
    getUserStub.restore();
    searchStub.restore();
  });

  it("Should throw UnauthorizedError", async () => {
    await expect(
      getUserTokens({
        userId: "123",
        authenticatedUser: {},
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return tokens", async () => {
    const user = {
      _id: "123",
    };
    getUserStub.resolves(user);

    searchStub.resolves({
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 1,
      },
      results: [],
    });

    const result = await getUserTokens({
      userId: "123",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(1);

    sinon.assert.calledOnce(searchStub);
    sinon.assert.calledWith(searchStub, {
      filters: {
        created_by: {
          _id: "123",
        },
        type: "ACCOUNT_CREATION",
      },
      pageNumber: 1,
      pageSize: 10,
    });
  });
});
