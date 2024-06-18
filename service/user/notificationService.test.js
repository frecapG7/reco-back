const Notification = require("../../model/Notification");
const { NotFoundError } = require("../../errors/error");
const sinon = require("sinon");
const notificationService = require("./notificationService");

describe("Test getNotifications", () => {
  let notificationStub;

  beforeEach(() => {
    notificationStub = sinon.stub(Notification, "find");
  });
  afterEach(() => {
    notificationStub.restore();
  });

  it("Should return notifications", async () => {
    notificationStub.withArgs({ user: "123" }).resolves([
      {
        _id: "123",
      },
    ]);
    const result = await notificationService.getNotifications({
      userId: "123",
    });
    expect(result).toBeDefined();
    expect(result.length).toEqual(1);
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

  it("Should throw a NotFoundError", async () => {
    notificationStub
      .withArgs(
        {
          _id: "123",
          user: "123",
        },
        {
          read: true,
        },
        { new: true }
      )
      .resolves(null);

    await expect(
      notificationService.markAsRead({
        userId: "123",
        notificationId: "123",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return notification", async () => {
    notificationStub
      .withArgs(
        {
          _id: "123",
          user: "123",
        },
        {
          read: true,
        },
        { new: true }
      )
      .resolves({
        _id: "123",
      });

    const result = await notificationService.markAsRead({
      userId: "123",
      notificationId: "123",
    });
    expect(result).toBeDefined();
  });
});

describe("Test markAllAsRead", () => {
  let notificationStub;

  beforeEach(() => {
    notificationStub = sinon.stub(Notification, "updateMany");
  });
  afterEach(() => {
    notificationStub.restore();
  });

  it("Should return notifications", async () => {
    notificationStub
      .withArgs(
        {
          user: "123",
        },
        { read: true }
      )
      .resolves({
        _id: "123",
      });

    const result = await notificationService.markAllAsRead({
      userId: "123",
    });
    expect(result).toBeDefined();
  });
});
