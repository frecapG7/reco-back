const Notification = require("../../../model/Notification");
const sinon = require("sinon");
const ObjectId = require("mongoose").Types.ObjectId;
const {
  getNotifications,
  countUnread,
  markAsRead,
  markAllAsRead,
} = require("./notificationsApiService");

describe("Test getNotifications", () => {
  let findStub;
  let countStub;

  beforeEach(() => {
    findStub = sinon.stub(Notification, "find");
    countStub = sinon.stub(Notification, "countDocuments");
  });
  afterEach(() => {
    findStub.restore();
    countStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(
      getNotifications({
        params: { userId: "123" },
        query: {},
        user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return all notifications", async () => {
    const expected = sinon.mock();

    expected.from = {
      _id: "123",
      name: "John Doe",
    };

    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("from", "name")
        .returns({
          exec: sinon.stub().resolves([expected]),
        }),
    });
    countStub.returns(10);

    const result = await getNotifications({
      params: { userId: "65df6cc757b41fec4d7c3055" },
      query: {},
      user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
    });
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(1);

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(10);

    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(findStub, { to: "65df6cc757b41fec4d7c3055" });
  });

  it("Should return notifications with arguments in the query", async () => {
    const expected = sinon.mock();

    expected.from = {
      _id: "123",
      name: "John Doe",
    };

    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("from", "name")
        .returns({
          exec: sinon.stub().resolves([expected]),
        }),
    });
    countStub.returns(10);

    const result = await getNotifications({
      params: { userId: "65df6cc757b41fec4d7c3055" },
      query: {
        pageSize: 5,
        page: 2,
        hideRead: true,
      },
      user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
    });
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(1);

    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.totalResults).toBe(10);

    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(findStub, {
      to: "65df6cc757b41fec4d7c3055",
      read: false,
    });
  });
});

describe("Test countUnread", () => {
  let countStub;

  beforeEach(() => {
    countStub = sinon.stub(Notification, "countDocuments");
  });
  afterEach(() => {
    countStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(
      countUnread({
        params: { userId: "123" },
        user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return unread notifications", async () => {
    countStub
      .withArgs({ to: "65df6cc757b41fec4d7c3055", read: false })
      .returns(10);

    const result = await countUnread({
      params: { userId: "65df6cc757b41fec4d7c3055" },
      user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
    });
    expect(result).toBeDefined();
    expect(result.value).toBe(10);
  });
});

describe("Test markAsRead", () => {
  let notificationStub;

  beforeEach(() => {
    notificationStub = sinon.stub(Notification, "findOneAndUpdate");
  });
  afterEach(() => {
    notificationStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(
      markAsRead({
        params: { userId: "123", notificationId: "123" },
        user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw a NotFoundError", async () => {
    notificationStub
      .withArgs(
        {
          _id: "123",
          user: "65df6cc757b41fec4d7c3055",
        },
        {
          read: true,
        },
        { new: true }
      )
      .resolves(null);

    await expect(
      markAsRead({
        params: { userId: "65df6cc757b41fec4d7c3055", notificationId: "123" },
        user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
      })
    ).rejects.toThrow("Notification not found");
  });

  it("Should return notification", async () => {
    const expected = sinon.mock();
    notificationStub
      .withArgs(
        {
          _id: "123",
          to: "65df6cc757b41fec4d7c3055",
        },
        {
          read: true,
        },
        { new: true }
      )
      .returns(expected);

    const result = await markAsRead({
      params: { userId: "65df6cc757b41fec4d7c3055", notificationId: "123" },
      user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
    });
    expect(result).toBeDefined();
  });
});

describe("Test markAllAsRead", () => {
  let updateManyStub;

  beforeEach(() => {
    updateManyStub = sinon.stub(Notification, "updateMany");
  });
  afterEach(() => {
    updateManyStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(
      markAllAsRead({
        params: { userId: "123" },
        user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should return notifications", async () => {
    updateManyStub
      .withArgs(
        {
          to: "65df6cc757b41fec4d7c3055",
        },
        { read: true }
      )
      .resolves({
        _id: "123",
      });

    const result = await markAllAsRead({
      params: { userId: "65df6cc757b41fec4d7c3055" },
      user: { _id: new ObjectId("65df6cc757b41fec4d7c3055") },
    });
    expect(result).toBeDefined();
  });
});
