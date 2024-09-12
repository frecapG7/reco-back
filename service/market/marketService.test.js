const sinon = require("sinon");
const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../errors/error");
const { MarketItem } = require("../../model/market/MarketItem");
const marketService = require("./marketService");

describe("Should validate getItems", () => {
  let marketItemStub;

  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem, "findById");
  });
  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should thrown NotFoundError", async () => {
    marketItemStub.withArgs("12345").returns(null);

    await expect(marketService.getItem({ id: "12345" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should thrown UnprocessableEntityError", async () => {
    marketItemStub.withArgs("12345").returns({
      enabled: false,
    });

    await expect(marketService.getItem({ id: "12345" })).rejects.toThrow(
      UnprocessableEntityError
    );
  });

  it("Should test happy path", async () => {
    marketItemStub.withArgs("12345").returns({
      enabled: true,
    });

    const result = await expect(marketService.getItem({ id: "12345" }));
    expect(result).toBeDefined();
  });
});

describe("Should validate searchItems", () => {
  const countDocumentsStub = sinon.stub(MarketItem, "countDocuments");
  const findStub = sinon.stub(MarketItem, "find");

  beforeEach(() => {
    countDocumentsStub.reset();
    findStub.reset();
  });

  it("Should return happy path with default values", async () => {
    countDocumentsStub.returns(10);
    findStub.returns({
      skip: () => ({
        limit: () => ({
          exec: () => {
            return [
              {
                name: "name",
                label: "label",
                title: "title",
                description: "description",
                price: 10,
                disable: false,
                created_by: "12345",
                created_at: new Date(),
                tags: ["tag1", "tag2"],
              },
            ];
          },
        }),
      }),
    });

    const result = await marketService.searchItems({
      value: "name",
    });

    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.totalResults).toEqual(10);
    expect(result.results.length).toEqual(1);
  });
});
