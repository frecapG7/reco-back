const sinon = require("sinon");

const marketService = require("../../market/marketService");

const { getRecentsIcon, buyIcon } = require("./iconStoreService");

describe("Test getRecentsIcon", () => {
  let searchItemsStub;

  beforeEach(() => {
    searchItemsStub = sinon.stub(marketService, "searchItems");
  });

  afterEach(() => {
    searchItemsStub.restore();
  });

  it("should return result", async () => {
    searchItemsStub
      .withArgs({
        value: "toto",
        type: "IconItem",
        page: 1,
        pageSize: 10,
      })
      .returns("any");

    const result = await getRecentsIcon({
      value: "toto",
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual("any");
  });
});

describe("Test buyIcon", () => {
  let getItemStub;
  let buyItemStub;

  beforeEach(() => {
    getItemStub = sinon.stub(marketService, "getItem");
    buyItemStub = sinon.stub(marketService, "buyItem");
  });

  afterEach(() => {
    getItemStub.restore();
    buyItemStub.restore();
  });

  it("Should throw a UnSupportedTypeError", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        type: "NotIconItem",
      });

    await expect(
      buyIcon({
        id: "123",
      })
    ).rejects.toThrow("Item 123 is not an IconItem");
  });

  it("Should buy icon", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "12345qs4365465345",
        type: "IconItem",
        name: "Krishna the Wise",
        price: 10,
        url: "https://thisIsValidUrl.com",
      });

    buyItemStub
      .withArgs({
        marketItem: {
          _id: "12345qs4365465345",
          type: "IconItem",
          name: "Krishna the Wise",
          price: 10,
          url: "https://thisIsValidUrl.com",
        },
        user: {
          _id: "536476465478458aefze",
        },
      })
      .returns({
        _id: "12345qs4365465345",
        type: "IconPurchase",
        name: "Krishna the Wise",
        icon: "https://thisIsValidUrl.com",
        payment_details: {
          price: 10,
          purchased_at: new Date(),
        },
      });

    const result = await buyIcon({
      id: "123",
      user: {
        _id: "536476465478458aefze",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Krishna the Wise");
    expect(result.icon).toBe("https://thisIsValidUrl.com");
  });
});
