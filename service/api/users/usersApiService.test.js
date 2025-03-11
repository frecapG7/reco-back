const tokenValidation = require("../../validation/tokenValidation");
const tokenService = require("../../token/tokenService");
const userService = require("../../user/userService");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const requestsServiceV2 = require("../../request/requestsServiceV2");
const User = require("../../../model/User");
const { ObjectId } = require("mongoose").Types;

const sinon = require("sinon");
const {
  signup,
  updateUser,
  updatePassword,
  getByName,
  getRecommendations,
  getRequests,
} = require("./usersApiService");

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
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    await expect(
      updateUser({ params: { id: "123" }, body: {}, user: { role: "USER" } })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should update user", async () => {
    const mockUser = sinon.mock();
    mockUser.save = sinon.stub().resolvesThis();

    findByIdStub.withArgs("123").resolves(mockUser);

    const result = await updateUser({
      params: { id: "123" },
      body: { avatar: "John Doe" },
      user: { role: "ADMIN" },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(mockUser.save);
  });
});

describe("Should test updatePassword function", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw a forbidden error for not being self", async () => {
    expect(updatePassword({ params: { id: "123" }, body: {} })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should throw a forbidden error for wrong old password", async () => {
    const user = sinon.mock();
    user.validPassword = sinon.stub().returns(false);
    findByIdStub.resolves(user);

    expect(
      updatePassword({
        params: {
          id: "64f6db09096d83b20116e62f",
        },
        body: {
          oldPassword: "test",
          newPassword: "test123",
        },
        user: {
          _id: new ObjectId("64f6db09096d83b20116e62f"),
        },
      })
    ).rejects.toThrow("Old password is incorrect");
  });
  it("Should update password", async () => {
    const user = sinon.mock();
    user.validPassword = sinon.stub().returns(true);
    user.setPassword = sinon.stub().returnsThis();
    user.save = sinon.stub().resolvesThis();
    findByIdStub.resolves(user);

    const result = await updatePassword({
      params: { id: "64f6db09096d83b20116e62f" },
      body: {
        oldPassword: "test",
        newPassword: "test123",
      },
      user: {
        _id: new ObjectId("64f6db09096d83b20116e62f"),
      },
    });

    expect(result).toBeDefined();
  });
});

describe("Should validate getByName function", () => {
  let findOneStub;

  beforeEach(() => {
    findOneStub = sinon.stub(User, "findOne");
  });

  afterEach(() => {
    findOneStub.restore();
  });

  it("Should throw a not found error", async () => {
    findOneStub.resolves(null);

    await expect(getByName({ params: { name: "John Doe" } })).rejects.toThrow(
      "User not found"
    );
  });

  it("Should return a user", async () => {
    const expected = sinon.mock();

    findOneStub.withArgs({ name: "John Doe" }).resolves(expected);

    const result = await getByName({ params: { name: "John Doe" } });

    expect(result).toBe(expected);
  });
});

describe("Should test getRecommendations function", () => {
  let findByIdStub;
  let paginatedSearchStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
    paginatedSearchStub = sinon.stub(
      recommendationsServiceV2,
      "paginatedSearch"
    );
  });

  afterEach(() => {
    findByIdStub.restore();
    paginatedSearchStub.restore();
  });

  it("Should throw a not found error", async () => {
    findByIdStub.resolves(null);

    await expect(getRecommendations({ params: { id: "123" } })).rejects.toThrow(
      "User not found"
    );
  });

  it("Should throw a forbidden error", async () => {
    const user = sinon.mock();
    user.settings = {
      privacy: {
        privateRecommendations: true,
      },
    };
    findByIdStub.resolves(user);

    await expect(getRecommendations({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return recommendations based on default values", async () => {
    const user = sinon.mock();
    user.settings = {
      privacy: {
        privateRecommendations: false,
      },
    };
    findByIdStub.resolves(user);

    const expectedRecommendation = sinon.mock();
    expectedRecommendation.isLikedBy = sinon.stub().returns(false);
    expectedRecommendation.toJSON = sinon.stub().returns({});
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
      showDuplicates: true,
      user,
    });
  });

  it("Should return recommendations based on query values", async () => {
    const user = sinon.mock();
    user.settings = {
      privacy: {
        privateRecommendations: false,
      },
    };
    findByIdStub.resolves(user);

    const expectedRecommendation = sinon.mock();
    expectedRecommendation.isLikedBy = sinon.stub().returns(false);
    expectedRecommendation.toJSON = sinon.stub().returns({});
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

describe("Should test getRequests function", () => {
  let findByIdStub;
  let paginatedSearchStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
    paginatedSearchStub = sinon.stub(requestsServiceV2, "paginatedSearch");
  });

  afterEach(() => {
    findByIdStub.restore();
    paginatedSearchStub.restore();
  });

  it("Should throw error on user not found", async () => {
    findByIdStub.resolves(null);

    await expect(getRequests({ params: { id: "123" } })).rejects.toThrow(
      "User not found"
    );
  });

  it("Should throw a forbidden error", async () => {
    const user = sinon.mock();
    user.settings = {
      privacy: {
        privateRequests: true,
      },
    };
    findByIdStub.resolves(user);

    await expect(getRequests({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return page of requests", async () => {
    const user = sinon.mock();
    user.settings = {
      privacy: {
        privateRequests: true,
      },
    };
    findByIdStub.resolves(user);

    const expected = sinon.mock();
    paginatedSearchStub.resolves(expected);

    const result = await getRequests({
      params: { id: "123" },
      query: {},
      user: { role: "ADMIN" },
    });

    expect(result).toBeDefined();
    expect(result).toBe(expected);
  });
});
