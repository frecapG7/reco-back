const sinon = require("sinon");
const { NotFoundError } = require("../../errors/error");
const { MarketItem } = require("../../model/market/MarketItem");

const { getItem, paginatedSearch, createItem } = require("./marketService");

describe("Should validate getItem", () => {
  let marketItemStub;

  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem, "findById");
  });
  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should thrown NotFoundError", async () => {
    marketItemStub.withArgs("12345").returns(null);

    await expect(getItem({ id: "12345" })).rejects.toThrow(NotFoundError);
  });

  it("Should test happy path", async () => {
    marketItemStub.withArgs("12345").returns({
      name: "name",
      label: "label",
      title: "title",
      description: "description",
      price: 10,
      disable: false,
      created_by: "12345",
      created_at: new Date(),
    });

    const result = await getItem({ id: "12345" });
    expect(result).toBeDefined();

    expect(result.name).toEqual("name");
  });
});

describe("Should validate paginatedSearch", () => {
  let findStub;
  let countDocumentsStub;

  beforeEach(() => {
    findStub = sinon.stub(MarketItem, "find");
    countDocumentsStub = sinon.stub(MarketItem, "countDocuments");
  });
  afterEach(() => {
    findStub.restore();
    countDocumentsStub.restore();
  });

  it("Should return happy path with default values", async () => {
    const expected = sinon.mock(MarketItem);

    countDocumentsStub.returns(10);
    findStub.returns([expected]);

    const result = await paginatedSearch({});

    expect(result).toBeDefined();

    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(2);
    expect(result.pagination.totalResults).toEqual(10);

    sinon.assert.calledOnce(countDocumentsStub);
    sinon.assert.calledOnce(findStub);

    sinon.assert.calledWith(
      findStub,
      {
        $or: [{ name: { $regex: "", $options: "i" } }, { tags: { $in: [""] } }],
        enabled: true,
      },
      null,
      {
        skip: 0,
        limit: 5,
        sort: { created_at: -1 },
      }
    );
  });

  it("Should return happy path with custom values", async () => {
    const expected = sinon.mock(MarketItem);

    countDocumentsStub.returns(10);
    findStub.returns([expected]);

    const result = await paginatedSearch({
      search: "search",
      type: "type",
      enabled: false,
      pageSize: 3,
      pageNumber: 1,
      sort: "modified",
      order: "asc",
    });

    expect(result).toBeDefined();

    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(4);
    expect(result.pagination.totalResults).toEqual(10);

    sinon.assert.calledOnce(countDocumentsStub);
    sinon.assert.calledOnce(findStub);

    sinon.assert.calledWith(
      findStub,
      {
        $or: [
          { name: { $regex: "search", $options: "i" } },
          { tags: { $in: ["search"] } },
        ],
        type: "type",
      },
      null,
      {
        skip: 0,
        limit: 3,
        sort: { modified: 1 },
      }
    );
  });
});

describe("Should validate createItem", () => {
  let existsStub;
  let saveStub;

  beforeEach(() => {
    existsStub = sinon.stub(MarketItem, "exists");
    saveStub = sinon.stub(MarketItem.prototype, "save");
  });

  afterEach(() => {
    existsStub.restore();
    saveStub.restore();
  });

  it("Should throw UnprocessableEntityError", async () => {
    await expect(createItem({ type: "UnknownType" })).rejects.toThrow(
      "Invalid item type"
    );
  });

  it("Should throw existing name error", async () => {
    existsStub.withArgs({ name: "Icon" }).resolves(true);

    const user = sinon.mock();
    await expect(
      createItem(
        {
          type: "IconItem",
          name: "Icon",
        },
        user
      )
    ).rejects.toThrow("Market item name already exists");
  });

  it("Should throw missing icon error", async () => {
    existsStub.withArgs({ name: "Icon" }).resolves(false);

    const user = sinon.mock();
    await expect(
      createItem(
        {
          type: "IconItem",
          name: "Icon",
          label: "Icon",
          description: "<p>Icon</p>",
        },
        user
      )
    ).rejects.toThrow("Wrong market place item body : missing icon");
  });

  it("Should create icon item", async () => {
    existsStub.withArgs({ name: "Icon" }).resolves(false);
    saveStub.resolvesThis();

    const user = sinon.mock();
    const result = await createItem(
      {
        type: "IconItem",
        name: "Icon",
        label: "Icon",
        description: "<p>Icon</p>",
        price: 10,
        tags: ["tag1", "tag2"],
        icon: "toto.url",
      },
      user
    );

    expect(result).toBeDefined();

    expect(result.name).toEqual("Icon");
    expect(result.label).toEqual("Icon");
    expect(result.description).toEqual("<p>Icon</p>");
    expect(result.price).toEqual(10);
    expect(result.tags).toEqual(["tag1", "tag2"]);
    expect(result.icon).toEqual("toto.url");

    sinon.assert.calledOnce(saveStub);
  });

  it("Should throw existing consumable type error", async () => {
    const user = sinon.mock();

    existsStub.withArgs({ name: "Consumable" }).resolves(false);
    existsStub
      .withArgs({ type: "ConsumableItem", consumableType: "invitation" })
      .resolves(true);

    await expect(
      createItem(
        {
          type: "ConsumableItem",
          name: "Consumable",
          label: "Consumable details",
          description: "<p>ergergegh</p>",
          price: 10,
          tags: ["tag1", "tag2"],
          icon: "toto.url",
          consumableType: "invitation",
        },
        user
      )
    ).rejects.toThrow("Consumable item type already exists");
  });

  it("Should create consumable item", async () => {
    const user = sinon.mock();

    existsStub.withArgs({ name: "Consumable" }).resolves(false);
    existsStub
      .withArgs({ type: "ConsumableItem", consumableType: "invitation" })
      .resolves(false);
    saveStub.resolvesThis();

    const result = await createItem(
      {
        type: "ConsumableItem",
        name: "Consumable",
        label: "Consumable details",
        description: "<p>ergergegh</p>",
        price: 10,
        tags: ["tag1", "tag2"],
        icon: "toto.url",
        consumableType: "invitation",
      },
      user
    );

    expect(result).toBeDefined();

    expect(result.name).toEqual("Consumable");
    expect(result.label).toEqual("Consumable details");
    expect(result.description).toEqual("<p>ergergegh</p>");
    expect(result.price).toEqual(10);
    expect(result.tags).toEqual(["tag1", "tag2"]);
    expect(result.icon).toEqual("toto.url");
    expect(result.consumableType).toEqual("invitation");

    sinon.assert.calledOnce(saveStub);
  });

  it("Should create provider item", async () => {
    const user = sinon.mock();

    existsStub.withArgs({ name: "Provider" }).resolves(false);
    existsStub
      .withArgs({ type: "ConsumableItem", consumableType: "invitation" })
      .resolves(false);
    saveStub.resolvesThis();

    const result = await createItem(
      {
        type: "ProviderItem",
        name: "Provider",
        label: "Consumable details",
        description: {
          en: "<p>ergergegh</p>",
          fr: "<p>ergergegh</p>",
        },
        price: 10,
        icon: "toto.url",
      },
      user
    );

    expect(result).toBeDefined();

    expect(result.name).toEqual("Provider");
    expect(result.label).toEqual("Consumable details");
    expect(result.i18nDescription.en).toEqual("<p>ergergegh</p>");
    expect(result.i18nDescription.fr).toEqual("<p>ergergegh</p>");
    expect(result.price).toEqual(10);
    expect(result.icon).toEqual("toto.url");

    sinon.assert.calledOnce(saveStub);
  });
});
