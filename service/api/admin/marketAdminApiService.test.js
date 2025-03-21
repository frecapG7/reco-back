const { MarketItem } = require("../../../model/market/MarketItem");
const sinon = require("sinon");
const {
  search,
  get,
  create,
  update,
  verifyUniqueName,
} = require("./marketAdminApiService");
const marketService = require("../../market/marketService");

describe("Should validate search function", () => {
  let paginatedSearchStub;

  beforeEach(() => {
    paginatedSearchStub = sinon.stub(marketService, "paginatedSearch");
  });

  afterEach(() => {
    paginatedSearchStub.restore();
  });

  it("Should throw unauthorized error ", async () => {
    await expect(search({ query: {}, user: {} })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return page with custom values", async () => {
    paginatedSearchStub.returns({
      pagination: {},
      results: [],
    });
    const result = await search({
      query: {
        search: "test",
        type: "test",
        pageNumber: 1,
        pageSize: 25,
      },
      user: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
  });
});

describe("Should validate get function", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(MarketItem, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw unautorized error", async () => {
    await expect(get({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should throw not found error", async () => {
    findByIdStub.returns({
      populate: sinon.stub().returns({
        exec: sinon.stub().returns(null),
      }),
    });

    await expect(
      get({ params: { id: "123" }, user: { role: "ADMIN" } })
    ).rejects.toThrow("Market item not found");
  });

  it("Should throw return market item", async () => {
    const expected = sinon.mock();
    expected.toJSON = sinon.stub().returns({ id: "123" });
    expected.created_by = { toJSON: sinon.stub().returns({ id: "123" }) };
    expected.modified_by = { toJSON: sinon.stub().returns({ id: "123" }) };
    expected.enabled = true;

    findByIdStub.returns({
      populate: sinon
        .stub()
        .withArgs("created_by")
        .returns({
          exec: sinon.stub().returns(expected),
        }),
    });

    const result = await get({
      params: { id: "123" },
      user: { role: "ADMIN" },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe("123");
    expect(result.created_by).toEqual({ id: "123" });
    expect(result.modified_by).toEqual({ id: "123" });
    expect(result.enabled).toBe(true);
  });
});

describe("Should validate create function", () => {
  let createItemStub;
  beforeEach(() => {
    createItemStub = sinon.stub(marketService, "createItem");
  });
  afterEach(() => {
    createItemStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(create({ body: {}, user: {} })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should return created item", async () => {
    const expected = sinon.mock();
    createItemStub.returns(expected);

    const result = await create({
      body: {
        name: "test",
        label: "test",
        description: "test",
        price: 1,
        tags: ["test"],
        url: "test",
      },
      user: {
        role: "ADMIN",
      },
    });

    expect(result).toEqual(expected);
  });
});

describe("Should validate update function", () => {
  let findByIdStub;
  let saveStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(MarketItem, "findById");
    saveStub = sinon.stub(MarketItem.prototype, "save");
  });

  afterEach(() => {
    findByIdStub.restore();
    saveStub.restore();
  });

  it("Should throw unauthorized error", async () => {
    await expect(
      update({
        params: { id: "123" },
        body: {},
        user: {},
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw not found error", async () => {
    findByIdStub.returns(null);

    await expect(
      update({
        params: { id: "123" },
        body: {},
        user: { role: "ADMIN" },
      })
    ).rejects.toThrow("Market item not found");
  });

  it("Should return updated item", async () => {
    const expected = sinon.mock();
    findByIdStub.returns(expected);
    expected.save = sinon.stub().returns(expected);

    const result = await update({
      params: { id: "123" },
      body: { label: "test" },
      user: { role: "ADMIN" },
    });

    expect(result).toEqual(expected);

    expect(result.label).toBe("test");
  });
});

describe("Should validate verifyUniqueName function", () => {
  let existsStub;

  beforeEach(() => {
    existsStub = sinon.stub(MarketItem, "exists");
  });
  afterEach(() => {
    existsStub.restore();
  });

  it("Should throw unprocessable entity error", async () => {
    existsStub.returns(true);

    await expect(verifyUniqueName({ body: { value: "test" } })).rejects.toThrow(
      "Market item name already exists"
    );
  });

  it("Should not throw error", async () => {
    existsStub.returns(false);

    await verifyUniqueName({ body: { value: "test" } });
  });
});
