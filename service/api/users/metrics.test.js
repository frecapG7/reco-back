const User = require("../../../model/User");
const userMetricsService = require("../../user/userMetricsService");
const { getMetrics, getBalance } = require("./metrics");
const sinon = require("sinon");

describe("Test getMetrics", () => {
  let findByIdStub;
  let getMetricsStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
    getMetricsStub = sinon.stub(userMetricsService, "getMetrics");
  });
  afterEach(() => {
    findByIdStub.restore();
    getMetricsStub.restore();
  });

  it("Should throw UnauthorizedError", async () => {
    await expect(
      getMetrics({ id: "id", authenticatedUser: {} })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw NotFoundError", async () => {
    findByIdStub.withArgs("id").resolves(null);
    await expect(
      getMetrics({ id: "id", authenticatedUser: { role: "ADMIN" } })
    ).rejects.toThrow("Cannot find user with id id");
  });

  it("Should return metrics", async () => {
    const user = sinon.mock();
    findByIdStub.withArgs("id").resolves(user);

    const metrics = { metrics: "metrics" };
    getMetricsStub.withArgs(user).resolves(metrics);

    const result = await getMetrics({
      id: "id",
      authenticatedUser: { role: "ADMIN" },
    });

    expect(result).toEqual(metrics);
  });
});

describe("Test getBalance", () => {
  let findByIdStub;
  let getBalanceStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
    getBalanceStub = sinon.stub(userMetricsService, "getBalance");
  });
  afterEach(() => {
    findByIdStub.restore();
    getBalanceStub.restore();
  });

  it("Should throw UnauthorizedError", async () => {
    await expect(
      getBalance({ id: "id", authenticatedUser: {} })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw NotFoundError", async () => {
    findByIdStub.withArgs("id").resolves(null);
    await expect(
      getBalance({ id: "id", authenticatedUser: { role: "ADMIN" } })
    ).rejects.toThrow("Cannot find user with id id");
  });

  it("Should return metrics", async () => {
    const user = sinon.mock();
    findByIdStub.withArgs("id").resolves(user);

    const balance = { balance: 5 };
    getBalanceStub.withArgs(user, true).resolves(balance);

    const result = await getBalance({
      id: "id",
      detailled: true,
      authenticatedUser: { role: "ADMIN" },
    });

    expect(result).toEqual(balance);
  });
});
