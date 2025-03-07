const sinon = require("sinon");
const User = require("../../model/User");
const userService = require("./userService");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const userValidation = require("../validation/userValidation");

describe("Test createUser", () => {
  let validateUsernameStub;
  let validateEmailStub;

  beforeEach(() => {
    validateUsernameStub = sinon.stub(
      userValidation,
      "validateUsernameUnicity"
    );
    validateEmailStub = sinon.stub(userValidation, "validateEmailUnicity");
  });
  afterEach(() => {
    validateUsernameStub.restore();
    validateEmailStub.restore();
  });

  it("Should reject on invalid username", async () => {
    validateUsernameStub.throws(new ForbiddenError("test"));

    await expect(
      userService.createUser({
        name: "test",
        password: "test",
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should reject on password mismatch", async () => {
    validateUsernameStub.resolves();
    validateEmailStub.resolves();

    await expect(
      userService.createUser({
        name: "test",
        password: "test",
        confirmPassword: "test2",
      })
    ).rejects.toThrow("password do not match");
  });

  it("Should test happy path", async () => {
    validateUsernameStub.resolves();
    validateEmailStub.resolves();

    const result = await userService.createUser({
      name: "test",
      email: "test",
      password: "test",
      confirmPassword: "test",
      defaultAvatar: "test",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("test");
    expect(result.email).toBe("test");
    expect(result.defaultAvatar).toBe("test");
    expect(result.password).not.toBe("test");
  });
});

describe("Test updateUser", () => {
  it("Should test happy path", async () => {
    const user = new User();
    user.name = "test";
    user.email = "test";
    user.avatar = "test";

    await userService.updateUser(user, {
      name: "test2",
      email: "test2",
      avatar: "test2",
    });

    expect(user.name).toBe("test2");
    expect(user.email).toBe("test2");
    expect(user.avatar).toBe("test2");
  });
});

describe("Test getUser", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw a not found error", async () => {
    findByIdStub.resolves(null);

    await expect(userService.getUser("123")).rejects.toThrow(NotFoundError);
  });

  it("Should return the user", async () => {
    const expected = new User();
    findByIdStub.resolves(expected);

    const result = await userService.getUser("123");

    expect(result).toEqual(expected);
  });
});

describe("Should validate paginatedSearch", () => {
  let countDocumentsStub;
  let findStub;

  beforeEach(() => {
    countDocumentsStub = sinon.stub(User, "countDocuments");
    findStub = sinon.stub(User, "find");
  });

  afterEach(() => {
    countDocumentsStub.restore();
    findStub.restore();
  });

  it("Should return paginated result based on default values", async () => {
    countDocumentsStub.resolves(10);
    findStub.resolves([]);

    const result = await userService.paginatedSearch({});

    expect(result).toBeDefined();

    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(10);

    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(0);

    sinon.assert.calledOnce(countDocumentsStub);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        $or: [
          { name: { $regex: "", $options: "i" } },
          { email: { $regex: "", $options: "i" } },
        ],
      },
      null,
      { skip: 0, limit: 10, sort: { created: 1 } }
    );
  });

  it("Should return paginated result based on custom values", async () => {
    countDocumentsStub.resolves(10);
    findStub.resolves([]);

    const result = await userService.paginatedSearch({
      search: "test",
      pageSize: 5,
      pageNumber: 2,
      sort: "name",
      order: "desc",
    });

    expect(result).toBeDefined();

    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.totalResults).toBe(10);

    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(0);

    sinon.assert.calledOnce(countDocumentsStub);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        $or: [
          { name: { $regex: "test", $options: "i" } },
          { email: { $regex: "test", $options: "i" } },
        ],
      },
      null,
      { skip: 5, limit: 5, sort: { name: -1 } }
    );
  });
});
