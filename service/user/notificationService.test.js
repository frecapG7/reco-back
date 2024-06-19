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
                  .withArgs("from", "to")
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

    countStub.withArgs({ to: "123" }).returns(1);

    const result = await notificationService.getNotifications({
      userId: "123",
    });
    expect(result).toBeDefined();
    expect(result.resultSet).toBeDefined();
    expect(result.resultSet.length).toBe(1);

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(50);
    expect(result.totalResults).toBe(1);
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
                  .withArgs("from", "to")
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

    countStub.withArgs({ to: "123", read: false }).returns(1);

    const result = await notificationService.getNotifications({
      userId: "123",
      hideRead: true,
      page: 2,
      pageSize: 10,
    });
    expect(result).toBeDefined();
    expect(result.resultSet).toBeDefined();
    expect(result.resultSet.length).toBe(1);

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.totalResults).toBe(1);
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
