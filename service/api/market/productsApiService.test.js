const sinon = require("sinon");
const { MarketItem } = require("../../../model/market/MarketItem");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const { search, getByName } = require("./productsApiService");
const marketService = require("../../market/marketService");

describe("Should validate search", () => {
  let paginatedSearchStub;

  beforeEach(() => {
    paginatedSearchStub = sinon.stub(marketService, "paginatedSearch");
  });
  afterEach(() => {
    paginatedSearchStub.restore();
  });

  it("Should return paginated results based on default values", async () => {
    paginatedSearchStub.resolves({
      pagination: {
        currentPage: 1,
        totalPages: 2,
        totalResults: 10,
      },
      results: [{ _id: "1234" }, { _id: "5678" }],
    });

    const result = await search({ query: {} });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(2);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.totalResults).toBe(10);

    sinon.assert.calledOnce(paginatedSearchStub);
    sinon.assert.calledWith(paginatedSearchStub, {
      enabled: true,
    });
  });
});

describe("Should validate getByName", () => {
  let findOneStub;
  let existsStub;

  beforeEach(() => {
    findOneStub = sinon.stub(MarketItem, "findOne");
    existsStub = sinon.stub(PurchaseItem, "exists");
  });

  afterEach(() => {
    findOneStub.restore();
    existsStub.restore();
  });

  it("Should throw not found error", async () => {
    findOneStub.resolves(null);

    await expect(getByName({ params: { name: "test" } })).rejects.toThrow(
      "Item test not found"
    );
  });

  it("Should return item with hasPurchased false", async () => {
    const expected = {
      name: "test",
      enabled: true,
      toJSON: () => ({ name: "test", enabled: true }),
    };
    findOneStub.resolves(expected);

    const result = await getByName({ params: { name: "test" } });

    expect(result).toBeDefined();
    expect(result.name).toBe("test");
    expect(result.enabled).toBe(true);
    expect(result.hasPurchased).toBe(false);

    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(existsStub);
  });

  it("Should return item with hasPurchased true", async () => {
    const expected = {
      name: "test",
      enabled: true,
      toJSON: () => ({ name: "test", enabled: true }),
    };
    findOneStub.resolves(expected);
    existsStub.resolves(true);

    const result = await getByName({
      params: { name: "test" },
      user: { _id: "123" },
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("test");
    expect(result.enabled).toBe(true);
    expect(result.hasPurchased).toBe(true);

    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledOnce(existsStub);
    sinon.assert.calledWith(existsStub, {
      user: { _id: "123" },
      item: expected,
    });
  });
});
