const Notification = require("../../model/Notification");
const { NotFoundError } = require("../../errors/error");
const sinon = require("sinon");
const notificationService = require("./notificationService");

describe("Test getNotifications", () => {
  let notificationStub;
  let countStub;

  beforeEach(() => {
    notificationStub = sinon.stub(Notification, "find");
    countStub = sinon.stub(Notification, "countDocuments");
  });
  afterEach(() => {
    notificationStub.restore();
    countStub.restore();
  });

  it("Should return all notifications", async () => {
    notificationStub.withArgs({ to: "123" }).returns({
      skip: sinon
        .stub()
        .withArgs(0)
        .returns({
          limit: sinon
            .stub()
            .withArgs(50)
            .returns({
              sort: sinon.stub().returns({
                populate: sinon
                  .stub()
                  .withArgs("from", "name")
                  .returns({
                    exec: sinon.stub().returns([
                      {
                        _id: "123",
                        from: {
                          _id: "123",
                          name: "John Doe",
                        },
                        type: "type",
                        createdAt: new Date(),
                      },
                    ]),
                  }),
              }),
            }),
        }),
    });

    countStub.withArgs({ to: "123" }).returns(10);

    const result = await notificationService.getNotifications({
      userId: "123",
    });
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(1);

    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(10);
  });

  it("Should return notifications with arguments in the query", async () => {
    notificationStub.withArgs({ to: "123", read: false }).returns({
      skip: sinon
        .stub()
        .withArgs(10)
        .returns({
          limit: sinon
            .stub()
            .withArgs(10)
            .returns({
              sort: sinon.stub().returns({
                populate: sinon
                  .stub()
                  .withArgs("from", "name")
                  .returns({
                    exec: sinon.stub().returns([
                      {
                        _id: "123",
                        from: {
                          _id: "123",
                          name: "John Doe",
                        },
                        type: "type",
                        createdAt: new Date(),
                      },
                    ]),
                  }),
              }),
            }),
        }),
    });

    countStub.withArgs({ to: "123", read: false }).returns(10);

    const result = await notificationService.getNotifications({
      userId: "123",
      hideRead: true,
      page: 2,
      pageSize: 10,
    });
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(1);

    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(10);
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

  it("Should return unread notifications", async () => {
    countStub.withArgs({ to: "123", read: false }).returns(10);

    const result = await notificationService.countUnread({
      userId: "123",
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
          to: "123",
        },
        {
          read: true,
        },
        { new: true }
      )
      .returns({
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
          to: "123",
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
