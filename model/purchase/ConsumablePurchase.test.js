const ConsumablePurchase = require("./ConsumablePurchase");

describe("Test ConsumablePurchase methods", () => {
  it("Should return a JSON object", () => {
    const consumable = new ConsumablePurchase({
      _id: "64f6db09096d83b20116e62f",
      name: "John",
      item: {
        _id: "64f6db09096d83b20116e62f",
        name: "Item",
        label: "Item",
        type: "Item",
      },
      payment_details: {
        price: 20,
        purchased_at: new Date(),
      },
      used: false,
      used_at: null,
    });

    const result = consumable.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toEqual("John");
    expect(result.type).toEqual("ConsumablePurchase");
    // expect(result.item).toBeDefined();
    // expect(result.item.id).toBeDefined();
    // expect(result.item.name).toEqual("Item");
    // expect(result.item.label).toEqual("Item");
    // expect(result.item.type).toEqual("ConsumablePurchase");
    expect(result.payment_details).toBeDefined();
    expect(result.payment_details.price).toEqual(20);

    expect(result.used).toBeDefined();
    expect(result.used).toEqual(false);
    expect(result.used_at).toBeDefined();
  });
});
