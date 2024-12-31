const { MarketConsumable } = require("../market/MarketItem");
const ConsumablePurchase = require("./ConsumablePurchase");

describe("Test ConsumablePurchase methods", () => {
  it("Should return a JSON object", () => {
    const consumable = new ConsumablePurchase({
      _id: "64f6db09096d83b20116e62f",
      name: "John",
      item: new MarketConsumable({
        _id: "64f6db09096d83b20116e62f",
        name: "Item",
        label: "Item",
        type: "Item",
        icon: "icon",
      }),
      payment_details: {
        price: 20,
        purchased_at: new Date(),
      },
      quantity: 1,
    });

    const result = consumable.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toEqual("John");
    expect(result.type).toEqual("ConsumablePurchase");
    expect(result.item).toBeDefined();
    expect(result.item.id).toBeDefined();
    expect(result.item.name).toEqual("Item");
    expect(result.item.label).toEqual("Item");
    expect(result.item.type).toEqual("ConsumableItem");

    expect(result.icon).toBeDefined();
    expect(result.icon).toEqual("icon");
    expect(result.quantity).toEqual(1);
  });
});
