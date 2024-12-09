const sinon = require("sinon");

const marketService = require("../../market/marketService");

const { getRecentsIcon, getIcon } = require("./iconStoreService");
const PurchaseItem = require("../../../model/purchase/PurchaseItem");

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

describe("Test getIcon", () => {
  let getItemStub;

  beforeEach(() => {
    getItemStub = sinon.stub(marketService, "getItem");
  });

  afterEach(() => {
    getItemStub.restore();
  });

  it("Should throw a UnSupportedTypeError", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "NotIconItem",
      });

    await expect(
      getIcon({
        id: "123",
      })
    ).rejects.toThrow("Item 123 is not an IconItem");
  });

  it("Should thrown UnprocessableEntityError", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "IconItem",
        enabled: false,
      });

    await expect(
      getIcon({
        id: "123",
      })
    ).rejects.toThrow("Cannot read disabled icon");
  });

  it("Should test happy path with no authenticated user", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "IconItem",
        enabled: true,
        toJSON: sinon.stub().returns({
          name: "name",
          label: "label",
          title: "title",
          description: "description",
          price: 10,
        }),
      });

    const result = await getIcon({
      id: "123",
    });

    expect(result).toBeDefined();
    expect(result.name).toEqual("name");
    expect(result.hasPurchased).toEqual(false);
    expect(result.hasQuantity).toEqual(0);
  });

  it("Should test happy path with an authenticated user", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "IconItem",
        enabled: true,
        toJSON: sinon.stub().returns({
          name: "name",
          label: "label",
          title: "title",
          description: "description",
          price: 10,
        }),
      });

    sinon.stub(PurchaseItem, "findOne").resolves({
      quantity: 10,
    });

    const result = await getIcon({
      id: "123",
      authenticatedUser: {
        _id: "123",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toEqual("name");
    expect(result.hasPurchased).toEqual(true);
    expect(result.hasQuantity).toEqual(10);

    PurchaseItem.findOne.restore();
  });
});
