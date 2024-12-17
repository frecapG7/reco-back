const sinon = require("sinon");
const User = require("../../model/User");
const userService = require("./userService");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const userValidation = require("../validation/userValidation");
const marketService = require("../market/marketService");
const IconPurchase = require("../../model/purchase/IconPurchase");

describe("Test createUser", () => {
  let validateUsernameStub;
  let userSaveStub;
  let getItemStub;
  let iconSaveStub;

  beforeEach(() => {
    validateUsernameStub = sinon.stub(
      userValidation,
      "validateUsernameUnicity"
    );
    userSaveStub = sinon.stub(User.prototype, "save");
    getItemStub = sinon.stub(marketService, "getItem");
    iconSaveStub = sinon.stub(IconPurchase.prototype, "save");
  });
  afterEach(() => {
    validateUsernameStub.restore();
    userSaveStub.restore();
    getItemStub.restore();
    iconSaveStub.restore();
  });

  it("Should reject on invalid username", async () => {
    validateUsernameStub.throws(new ForbiddenError("test"));

    await expect(
      userService.createUser(
        {
          name: "test",
          password: "test",
        },
        "3354az"
      )
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should reject on password mismatch", async () => {
    validateUsernameStub.resolves();

    await expect(
      userService.createUser(
        {
          name: "test",
          password: "test",
          confirmPassword: "test2",
        },
        "3354az"
      )
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should reject on invalid icon", async () => {
    validateUsernameStub.resolves();

    getItemStub.resolves({
      type: "ConsumableItem",
      enabled: false,
      freeOnSignup: false,
    });

    await expect(
      userService.createUser({
        name: "test",
        password: "test",
        confirmPassword: "test",
        icon_id: "123",
      })
    ).rejects.toThrow("Invalid icon");
  });

  it("Should test happy path", async () => {
    validateUsernameStub.resolves();
    getItemStub.resolves({
      type: "IconItem",
      enabled: true,
      freeOnSignup: true,
      url: "test",
    });

    userSaveStub.resolvesThis();
    iconSaveStub.resolvesThis();

    const result = await userService.createUser({
      name: "test",
      password: "test",
      confirmPassword: "test",
      icon_id: "123",
    });

    expect(result).toBeDefined();
  });
});

describe("Test updateUser", () => {
  let userFindByIdAndUpdateStub;

  beforeEach(() => {
    userFindByIdAndUpdateStub = sinon.stub(User, "findByIdAndUpdate");
  });
  afterEach(() => {
    userFindByIdAndUpdateStub.restore();
  });

  it("Should throw a not found error", async () => {
    userFindByIdAndUpdateStub.resolves(null);

    await expect(userService.updateUser("123", {})).rejects.toThrow(
      NotFoundError
    );
  });
  it("Should test happy path", async () => {
    const expected = new User();
    userFindByIdAndUpdateStub.resolves(expected);

    const result = await expect(
      userService.updateUser("123", {
        name: "test",
        email: "test",
      })
    );

    expect(
      userFindByIdAndUpdateStub.calledWith(
        "123",
        {
          name: "test",
          email: "test",
        },
        { new: true }
      )
    );

    // expect(result).toEqual(expected);
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
