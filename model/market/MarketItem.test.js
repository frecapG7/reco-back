const {
  MarketIcon,
  MarketTitle,
  MarketConsumable,
  MarketProvider,
} = require("./MarketItem");
describe("Validate MarketItem methods", () => {
  it("Should return a JSON object with the correct properties for an MarketIcon", async () => {
    const marketIcon = new MarketIcon({
      _id: "60f7b3b3b3b3b3b3b3b3b3b3",
      name: "Test MarketIcon",
      label: "Test Label",
      i18nDescription: {
        en: "This is english description",
        fr: "Description en français",
      },
      price: 100,
      tags: ["Test", "MarketIcon"],
      icon: "http://test.com/test.png",
    });

    const result = marketIcon.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Test MarketIcon");
    expect(result.label).toBe("Test Label");
    expect(result.description).toBeDefined();
    expect(result.description.en).toBe("This is english description");
    expect(result.description.fr).toBe("Description en français");
    expect(result.price).toBe(100);
    expect(result.tags).toEqual(["Test", "MarketIcon"]);
    expect(result.type).toBe("IconItem");
    expect(result.icon).toBe("http://test.com/test.png");
  });

  it("Should return a JSON object with the correct properties for an MarketTitle", async () => {
    const marketTitle = new MarketTitle({
      _id: "60f7b3b3b3b3b3b3b3b3b3",
      name: "Test MarketTitle",
      label: "Test Label",
      i18nDescription: {
        en: "This is english description",
        fr: "Description en français",
      },
      price: 100,
      tags: ["Test", "MarketTitle"],
      titleValue: "Test Title",
    });

    const result = marketTitle.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Test MarketTitle");
    expect(result.label).toBe("Test Label");
    expect(result.description).toBeDefined();
    expect(result.description.en).toBe("This is english description");
    expect(result.description.fr).toBe("Description en français");
    expect(result.price).toBe(100);
    expect(result.tags).toEqual(["Test", "MarketTitle"]);
    expect(result.type).toBe("TitleItem");
    expect(result.titleValue).toBe("Test Title");
  });

  it("Should return a JSON object with the correct properties for an MarketConsumable", async () => {
    const marketConsumable = new MarketConsumable({
      _id: "60f7b3b3b3b3b3b3b3b3b3",
      name: "Test MarketConsumable",
      label: "Test Label",
      i18nDescription: {
        en: "This is english description",
        fr: "Description en français",
      },
      price: 100,
      tags: ["Test", "MarketConsumable"],
      icon: "http://test.com/test.png",
      consumableType: "invitation",
    });

    const result = marketConsumable.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Test MarketConsumable");
    expect(result.label).toBe("Test Label");
    expect(result.description).toBeDefined();
    expect(result.description.en).toBe("This is english description");
    expect(result.description.fr).toBe("Description en français");
    expect(result.price).toBe(100);
    expect(result.tags).toEqual(["Test", "MarketConsumable"]);
    expect(result.type).toBe("ConsumableItem");
    expect(result.icon).toBe("http://test.com/test.png");
    expect(result.consumableType).toBe("invitation");
  });

  it("Should return a JSON object with the correct properties for an MarketProvider", async () => {
    const marketConsumable = new MarketProvider({
      _id: "60f7b3b3b3b3b3b3b3b3b3",
      name: "Test MarketConsumable",
      label: "Test Label",
      i18nDescription: {
        en: "This is english description",
        fr: "Description en français",
      },
      price: 100,
      tags: ["Test", "MarketConsumable"],
      icon: "http://test.com/test.png",
    });

    const result = marketConsumable.toJSON();

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Test MarketConsumable");
    expect(result.label).toBe("Test Label");
    expect(result.description).toBeDefined();
    expect(result.description.en).toBe("This is english description");
    expect(result.description.fr).toBe("Description en français");
    expect(result.price).toBe(100);
    expect(result.tags).toEqual(["Test", "MarketConsumable"]);
    expect(result.type).toBe("ProviderItem");
    expect(result.icon).toBe("http://test.com/test.png");
  });
});
