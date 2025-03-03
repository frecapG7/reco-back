const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const userService = require("../../user/userService");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");

const sinon = require("sinon");
const { signup, updateUser, getRecommendations } = require("./usersApiService");
const User = require("../../../model/User");

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

describe("Should test getRecommendations function", () => {
  let getUserStub;
  let paginatedSearchStub;

  beforeEach(() => {
    getUserStub = sinon.stub(userService, "getUser");
    paginatedSearchStub = sinon.stub(
      recommendationsServiceV2,
      "paginatedSearch"
    );
  });

  afterEach(() => {
    getUserStub.restore();
    paginatedSearchStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRecommendations: true,
        },
      },
    });
    getUserStub.resolves(user);

    await expect(getRecommendations({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return recommendations based on default values", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRecommendations: false,
        },
      },
    });
    getUserStub.resolves(user);

    const expectedRecommendation = {
      isLikedBy: sinon.stub().returns(false),
      toJSON: () => ({}),
    };
    paginatedSearchStub.resolves({
      pagination: {},
      results: [expectedRecommendation],
    });

    const result = await getRecommendations({
      params: { id: "123" },
      query: {},
    });

    expect(result).toBeDefined();
    expect(result.results).toHaveLength(1);

    sinon.assert.calledWith(paginatedSearchStub, {
      requestType: "",
      search: "",
      showDuplicates: true,
      user,
      pageNumber: 1,
      pageSize: 5,
    });
  });

  it("Should return recommendations based on query values", async () => {
    const user = new User({
      _id: "123",
      settings: {
        privacy: {
          privateRecommendations: false,
        },
      },
    });
    getUserStub.resolves(user);

    const expectedRecommendation = {
      isLikedBy: sinon.stub().returns(false),
      toJSON: () => ({}),
    };
    paginatedSearchStub.resolves({
      pagination: {},
      results: [expectedRecommendation],
    });

    const result = await getRecommendations({
      params: { id: "123" },
      query: {
        requestType: "SONG",
        search: "Hello",
        pageNumber: 2,
        pageSize: 10,
      },
    });

    expect(result).toBeDefined();
    expect(result.results).toHaveLength(1);

    sinon.assert.calledWith(paginatedSearchStub, {
      requestType: "SONG",
      search: "Hello",
      showDuplicates: true,
      user,
      pageNumber: 2,
      pageSize: 10,
    });
  });
});
