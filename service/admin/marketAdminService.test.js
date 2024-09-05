const {
  createIconItem,
  getMarketItem,
  searchItems,
  updateItem,
} = require("./marketAdminService");
const { MarketItem } = require("../../model/market/MarketItem");
const {
  UnAuthorizedError,
  UnSupportedTypeError,
  UnprocessableEntityError,
  NotFoundError,
} = require("../../errors/error");

const sinon = require("sinon");

describe("Test createIconItem", () => {
  let existsStub;
  let marketItemStub;

  beforeEach(() => {
    existsStub = sinon.stub(MarketItem, "exists");
    marketItemStub = sinon.stub(MarketItem.prototype, "save");
  });

  afterEach(() => {
    existsStub.restore();
    marketItemStub.restore();
  });

  it("Should throw unAuthorized error", async () => {
    await expect(
      createIconItem({
        data: {},
        authenticatedUser: {
          role: "USER",
        },
      })
    ).rejects.toThrow(UnAuthorizedError);
  });
  it("Should throw UnprocessableEntityError", async () => {
    existsStub.resolves(true);

    await expect(
      createIconItem({
        data: {
          name: "Toto",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(UnprocessableEntityError);
  });

  it("Should throw UnprocessableEntityError", async () => {
    existsStub.resolves(false);

    await expect(
      createIconItem({
        data: {
          name: "Toto",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(UnprocessableEntityError);
  });

  it("Should create icon item", async () => {
    existsStub.resolves(false);
    marketItemStub.resolvesThis();

    const result = await expect(
      createIconItem({
        data: {
          name: "Icon",
          url: "toto.url",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    );

    expect(result).toBeDefined();
  });
});

describe("Test updateItem", () => {
  let existStub;
  let findByIdAndUpdateStub;

  beforeEach(() => {
    existStub = sinon.stub(MarketItem, "exists");
    findByIdAndUpdateStub = sinon.stub(MarketItem, "findByIdAndUpdate");
  });

  afterEach(() => {
    existStub.restore();
    findByIdAndUpdateStub.restore();
  });

  it("Should throw unAuthorized error", async () => {
    await expect(
      updateItem({
        id: "123",
        data: {},
        authenticatedUser: {
          role: "USER",
        },
      })
    ).rejects.toThrow(UnAuthorizedError);
  });

  it("Should throw NotFoundError", async () => {
    existStub.resolves(false);

    findByIdAndUpdateStub.returns(null);

    await expect(
      updateItem({
        id: "123",
        data: {
          name: "Toto",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should update iteù", async () => {
    existStub.resolves(false);
    findByIdAndUpdateStub
      .withArgs("123", {
        name: "Icon",
        modified_by: {
          role: "ADMIN",
        },
      })
      .returns({});

    const result = await expect(
      createIconItem({
        id: "123",
        data: {
          name: "Icon",
          url: "toto.url",
        },
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    );

    expect(result).toBeDefined();
  });
});

describe("Test getMarketItem", () => {
  let marketItemStub;

  beforeEach(() => {
    marketItemStub = sinon.stub(MarketItem, "findById");
  });
  afterEach(() => {
    marketItemStub.restore();
  });

  it("Should throw unAuthorizedError", async () => {
    await expect(
      getMarketItem({
        itemId: "azaeaa112",
        authenticatedUser: {
          role: "USER",
        },
      })
    ).rejects.toThrow(UnAuthorizedError);
  });

  it("Should throw NotFoundError", async () => {
    marketItemStub.withArgs("azaeaa112").returns({
      populate: sinon
        .stub()
        .withArgs("created_by")
        .returns({
          populate: sinon
            .stub()
            .withArgs("modified_by")
            .returns({
              exec: () => null,
            }),
        }),
    });
    await expect(
      getMarketItem({
        itemId: "azaeaa112",
        authenticatedUser: {
          role: "ADMIN",
        },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return item", async () => {
    marketItemStub.withArgs("azaeaa112").returns({
      populate: sinon
        .stub()
        .withArgs("created_by")
        .returns({
          populate: sinon
            .stub()
            .withArgs("modified_by")
            .returns({
              exec: () => ({
                _id: "expected",
              }),
            }),
        }),
    });

    const result = await getMarketItem({
      itemId: "azaeaa112",
      authenticatedUser: {
        role: "ADMIN",
      },
    });

    expect(result).toBeDefined();
    expect(result._id).toEqual("expected");
  });
});

describe("Test searchItems", () => {
  const countDocumentsStub = sinon.stub(MarketItem, "countDocuments");
  const findStub = sinon.stub(MarketItem, "find");

  beforeEach(() => {
    countDocumentsStub.reset();
    findStub.reset();
  });

  it("Should return items with default values", async () => {
    countDocumentsStub.resolves(10);
    findStub.returns({
      skip: () => ({
        limit: () => ({
          populate: sinon
            .stub()
            .withArgs("created_by")
            .returns({
              exec: () => [
                {
                  name: "name",
                  label: "label",
                  title: "title",
                  description: "description",
                  price: 10,
                  disable: false,
                  created_by: "12345",
                },
              ],
            }),
        }),
      }),
    });

    const result = await searchItems({});

    expect(result).toBeDefined();
    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.totalResults).toEqual(10);
    expect(result.results).toBeDefined();
    expect(result.results.length).toEqual(1);
  });
});
