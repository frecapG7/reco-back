const sinon = require("sinon");

const {
  getConsumableItems,
  buyConsumable,
} = require("./consumableStoreService");
const { UnSupportedTypeError } = require("../../../errors/error");

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

describe("Test buyConsumable", () => {
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
        type: "NotConsumableItem",
      });

    await expect(
      buyConsumable({
        id: "123",
      })
    ).rejects.toThrow("Item 123 is not a ConsumableItem");
  });

  it("Should buy consumable", async () => {
    const item = {
      _id: "12345qs4365465345",
      type: "ConsumableItem",
      name: "Krishna the Wise",
      price: 10,
      icon: "toto",
      consumableType: "invitation",
    };

    getItemStub
      .withArgs({
        id: "123",
      })
      .returns(item);

    buyItemStub.returns({
      _id: "12345qs4365465345",
      type: "ConsumablePurchase",
      name: "Krishna the Wise",
      payment_details: {
        price: 10,
        purchased_at: new Date(),
      },
    });

    const result = await buyConsumable({
      id: "123",
      user: {
        _id: "536476465478458aefze",
      },
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Krishna the Wise");

    // sinon.assert.calledWith(buyItemStub, {
    //   marketItem: item,
    //   user: {
    //     _id: "536476465478458aefze",
    //   },
    // });
  });
});
