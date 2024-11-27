const { eq } = require("lodash");
const User = require("../../../model/User");

const { postFollow, getFollows, removeFollow } = require("./follows");
const sinon = require("sinon");

describe("Follow user", () => {
  let userFindByIdStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    userFindByIdStub.restore();
  });

  it("Should throw a forbiden error if the user is not the same as the authenticated user", async () => {
    await expect(
      postFollow({ id: "123", body: { userId: "" } })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw an error if the body is empty", async () => {
    await expect(
      postFollow({
        id: "123",
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("userId is required");
  });
  it("Should throw an error because you cannot follow yourself morron", async () => {
    await expect(
      postFollow({
        id: "123",
        body: { userId: "123" },
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("You can't follow yourself");
  });

  it("Should throw an error if the user is not found", async () => {
    userFindByIdStub.returns(null);

    await expect(
      postFollow({
        id: "123",
        body: { userId: "1245" },
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("User not found");
  });

  it("Should throw an error if the follow is not found", async () => {
    const user = sinon.mock();
    userFindByIdStub.withArgs("123").returns(user);

    userFindByIdStub.withArgs("1245").returns(null);

    await expect(
      postFollow({
        id: "123",
        body: { userId: "1245" },
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("User to follow not found");
  });

  it("Should throw an error if the user is already following the follow", async () => {
    const follow = sinon.mock();
    const user = {
      follows: [follow],
    };
    userFindByIdStub.withArgs("123").returns(user);
    userFindByIdStub.withArgs("1245").returns(follow);

    await expect(
      postFollow({
        id: "123",
        body: { userId: "1245" },
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("You are already following this user");
  });

  it("Should follow the user", async () => {
    const follow = sinon.mock({
      _id: "1245",
    });
    const user = {
      follows: [],
      save: sinon.stub().returnsThis(),
    };
    userFindByIdStub.withArgs("123").returns(user);
    userFindByIdStub.withArgs("1245").returns(follow);

    const result = await postFollow({
      id: "123",
      body: { userId: "1245" },
      authenticatedUser: { role: "ADMIN" },
    });

    expect(user.save.calledOnce).toBe(true);
    expect(result).toEqual(user);
  });
});

describe("Get follows", () => {
  let userFindByIdStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    userFindByIdStub.restore();
  });

  it("Should throw a forbiden error if the user is not the same as the authenticated user", async () => {
    await expect(getFollows({ id: "123" })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should throw an error if the user is not found", async () => {
    userFindByIdStub.returns(null);

    await expect(
      getFollows({
        id: "123",
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("User not found");
  });

  it("Should returns follows ", async () => {
    const user = {
      follows: [{ user: "456" }, { user: "124" }],
    };

    userFindByIdStub.withArgs("123").returns(user);

    const follow1 = sinon.mock();
    const follow2 = sinon.mock();
    userFindByIdStub.withArgs("456").returns(follow1);
    userFindByIdStub.withArgs("124").returns(follow2);

    const result = await getFollows({
      id: "123",
      authenticatedUser: { role: "ADMIN" },
    });

    expect(result).toBeDefined();

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(2);

    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(2);
    expect(result.results[0]).toEqual(follow1);
  });
});

describe("Remove follow", () => {
  let userFindByIdStub;

  beforeEach(() => {
    userFindByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    userFindByIdStub.restore();
  });

  it("Should throw a forbiden error if the user is not the same as the authenticated user", async () => {
    await expect(
      removeFollow({ id: "123", body: { userId: "" } })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw an error if the body is empty", async () => {
    await expect(
      removeFollow({
        id: "123",
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("userId is required");
  });

  it("Should throw an error because you cannot unfollow yourself morron", async () => {
    await expect(
      removeFollow({
        id: "123",
        body: { userId: "123" },
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("You can't unfollow yourself");
  });

  it("Should throw an error if the user is not found", async () => {
    userFindByIdStub.returns(null);

    await expect(
      removeFollow({
        id: "123",
        body: { userId: "1245" },
        authenticatedUser: { role: "ADMIN" },
      })
    ).rejects.toThrow("User not found");
  });

  it("Should remove the follow", async () => {
    const user = {
      follows: [
        {
          user: {
            equals: sinon.stub().returns(true),
          },
        },
      ],
      save: sinon.stub().returnsThis(),
    };
    userFindByIdStub.withArgs("123").returns(user);

    const result = await removeFollow({
      id: "123",
      body: { userId: "1245" },
      authenticatedUser: { role: "ADMIN" },
    });

    expect(user.save.calledOnce).toBe(true);
    expect(result).toEqual(user);
    expect(result.follows.length).toBe(0);
  });
});
