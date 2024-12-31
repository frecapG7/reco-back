const IconPurchase = require("./IconPurchase");

describe("Test IconPurchase methods", () => {
  it("Should return a JSON object", () => {
    const consumable = new IconPurchase({
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
      icon: "icon",
    });

    const result = consumable.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toEqual("John");
    expect(result.type).toEqual("IconPurchase");
    // expect(result.item).toBeDefined();
    // expect(result.item.id).toBeDefined();
    // expect(result.item.name).toEqual("Item");
    // expect(result.item.label).toEqual("Item");
    // expect(result.item.type).toEqual("ConsumablePurchase");
    expect(result.payment_details).toBeDefined();
    expect(result.payment_details.price).toEqual(20);

    expect(result.icon).toBeDefined();
    expect(result.icon).toEqual("icon");
  });
});
