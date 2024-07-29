const sinon = require("sinon");
const {
  NotFoundError,
  UnprocessableEntityError,
} = require("../../errors/error");
const { MarketItem } = require("../../model/market/MarketItem");
const { marketService } = require("./marketService");

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

    await expect(marketService.getItems({ id: "12345" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should thrown UnprocessableEntityError", async () => {
    marketItemStub.withArgs("12345").returns({
      disable: true,
    });

    await expect(marketService.getItems({ id: "12345" })).rejects.toThrow(
      UnprocessableEntityError
    );
  });

  it("Should test happy path", async () => {
    marketItemStub.withArgs("12345").returns({
      disable: false,
    });

    const result = await expect(marketService.getItems({ id: "12345" }));
    expect(result).toBeDefined();
  });
});
