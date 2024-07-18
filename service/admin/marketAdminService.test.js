const { createMarketItem } = require("./marketAdminService");
const { MarketItem } = require("../../model/market/MarketItem");
const {
  UnAuthorizedError,
  UnSupportedTypeError,
} = require("../../errors/error");

const sinon = require("sinon");

describe("Test createMarketItem", () => {
  let marketItemStub;
  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem.prototype, "save");
  });

  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should throw unAuthorized error", async () => {
    await expect(
      createMarketItem({
        item: {
          type: "Icon",
        },
        authenticatedUser: {
          role: "USER",
        },
      })
    ).rejects.toThrow(UnAuthorizedError);
  });
  it("Should throw UnSupportedTypeError", async () => {
    await expect(
      createMarketItem({
        item: {
          type: "Invalid",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(UnSupportedTypeError);
  });

  it("Should create icon item", async () => {
    marketItemStub.resolvesThis();

    const result = await expect(
      createMarketItem({
        item: {
          type: "Icon",
          svgContent: "toto",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    );

    expect(result).toBeDefined();
  });
});
