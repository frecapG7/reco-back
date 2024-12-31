const sinon = require("sinon");

const PurchaseItem = require("../../../model/purchase/PurchaseItem");
const {
  getConsumableItems,
  getConsumable,
} = require("./consumableStoreService");

const marketService = require("../../market/marketService");

describe("Test getConsumableItems", () => {
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
        type: "ConsumableItem",
        page: 1,
        pageSize: 15,
      })
      .returns("any");

    const result = await getConsumableItems();

    expect(result).toEqual("any");
  });
});

describe("Test getConsumable", () => {
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
        type: "NotConsumableItem",
      });

    await expect(
      getConsumable({
        id: "123",
      })
    ).rejects.toThrow("Item 123 is not a ConsumableItem");
  });

  it("Should thrown UnprocessableEntityError", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "ConsumableItem",
        enabled: false,
      });

    await expect(
      getConsumable({
        id: "123",
      })
    ).rejects.toThrow("Cannot read disabled consumable");
  });

  it("Should test happy path with no authenticated user", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "ConsumableItem",
        enabled: true,
        toJSON: sinon.stub().returns({
          name: "name",
          label: "label",
          title: "title",
          description: "description",
          price: 10,
        }),
      });

    const result = await getConsumable({
      id: "123",
    });

    expect(result).toBeDefined();
    expect(result.name).toEqual("name");
    expect(result.hasPurchased).toEqual(false);
    expect(result.purchasesCount).toEqual(0);
  });

  it("Should test happy path with an authenticated user", async () => {
    getItemStub
      .withArgs({
        id: "123",
      })
      .returns({
        _id: "123",
        type: "ConsumableItem",
        enabled: true,
        toJSON: sinon.stub().returns({
          name: "name",
          label: "label",
          title: "title",
          description: "description",
          price: 10,
        }),
      });

    sinon.stub(PurchaseItem, "countDocuments").returns(10);

    const result = await getConsumable({
      id: "123",
      authenticatedUser: {
        _id: "123",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toEqual("name");
    expect(result.hasPurchased).toEqual(true);
    expect(result.purchasesCount).toEqual(10);

    PurchaseItem.countDocuments.restore();
  });
});
