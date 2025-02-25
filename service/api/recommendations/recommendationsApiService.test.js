const sinon = require("sinon");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");
const embedService = require("../../embed/embedService");
const {
  get,
  getFromEmbed,
  create,
  search,
} = require("./recommendationsApiService");

describe("Should validate get", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Recommendation, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw NotFoundError", async () => {
    findByIdStub.resolves(null);

    await expect(get({ params: { id: "123" } })).rejects.toThrowError(
      "Recommendation not found"
    );
  });

  it("Should return recommendation", async () => {
    const expected = sinon.mock(Recommendation);

    findByIdStub.resolves(expected);

    const result = await get({ params: { id: "123" } });

    expect(result).toEqual(expected);
  });
});

describe("Should validate getFromEmbed", () => {
  let findOneStub;
  let getEmbedStub;

  beforeEach(() => {
    findOneStub = sinon.stub(Recommendation, "findOne");
    getEmbedStub = sinon.stub(embedService, "getEmbed");
  });

  afterEach(() => {
    findOneStub.restore();
    getEmbedStub.restore();
  });

  it("Should throw error on missing url", async () => {
    await expect(
      getFromEmbed({
        query: {},
      })
    ).rejects.toThrow("Url is required");
  });

  it("Should return from url", async () => {
    const expected = sinon.mock();

    findOneStub.resolves(expected);

    const result = await getFromEmbed({
      query: {
        url: "url",
      },
    });

    expect(result).toEqual(expected);

    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledWith(findOneStub, {
      url: { $regex: "url" },
    });
    sinon.assert.notCalled(getEmbedStub);
  });

  it("Should return duplicated from embed", async () => {
    findOneStub.withArgs({ url: "url" }).resolves(null);

    getEmbedStub.resolves({
      title: "GNX",
      author: "Kendrick Lamar",
    });

    const duplicatedRecommendation = sinon.mock();
    findOneStub
      .withArgs({ $and: [{ field1: "GNX" }, { field2: "Kendrick Lamar" }] })
      .resolves(duplicatedRecommendation);

    const result = await getFromEmbed({
      query: {
        url: "url",
      },
    });

    expect(result).toBeDefined();
    expect(result).toEqual(duplicatedRecommendation);
  });

  it("Should return original from embed", async () => {
    findOneStub.withArgs({ url: "url" }).resolves(null);

    getEmbedStub.resolves({
      title: "GNX",
      author: "Kendrick Lamar",
      description: "Good song",
      provider: {
        name: "Youtube",
        icon: "icon",
      },
      html: "html",
      url: "url",
    });

    findOneStub
      .withArgs({ $and: [{ field1: "GNX" }, { field2: "Kendrick Lamar" }] })
      .resolves(null);

    const result = await getFromEmbed({
      query: {
        url: "url",
      },
    });

    expect(result).toBeDefined();
    expect(result.field1).toEqual("GNX");
    expect(result.field2).toEqual("Kendrick Lamar");
    expect(result.field3).toEqual("Good song");
    expect(result.provider).toEqual({
      name: "Youtube",
      icon: "icon",
    });
    expect(result.html).toEqual("html");
    expect(result.url).toEqual("url");
  });
});

describe("Should validate search", () => {
  let paginatedSearchStub;

  beforeEach(() => {
    paginatedSearchStub = sinon.stub(recommendationsService, "paginatedSearch");
  });

  afterEach(() => {
    paginatedSearchStub.restore();
  });

  it("Should throw error on missing requestType", async () => {
    await expect(
      search({
        query: {},
      })
    ).rejects.toThrow("requestType is required");
  });

  it("Should return page", async () => {
    const expected = sinon.mock();

    paginatedSearchStub.resolves(expected);

    const result = await search({
      query: {
        requestType: "SONG",
        search: "search",
        pageNumber: 1,
        pageSize: 5,
      },
    });

    expect(result).toEqual(expected);
  });
});

describe("Should test create recommendation", () => {
  let addCreditStub;
  let createStub;
  let findOneStub;

  beforeEach(() => {
    addCreditStub = sinon.stub(creditService, "addCredit");
    createStub = sinon.stub(recommendationsService, "create");
    findOneStub = sinon.stub(Recommendation, "findOne");
  });

  afterEach(() => {
    addCreditStub.restore();
    createStub.restore();
    findOneStub.restore();
  });

  it("Should throw error on unauthenticated", async () => {
    await expect(
      create({
        body: {},
      })
    ).rejects.toThrow(
      "You need to be authenticated to create a recommendation"
    );
  });

  it("Should throw error on existing recommendation", async () => {
    findOneStub.resolves(sinon.mock(Recommendation));

    await expect(
      create({
        body: {
          field1: "PLK",
          field2: "Faut pas",
          url: "url",
        },
        user: { _id: "userId" },
      })
    ).rejects.toThrow("Recommendation already exists");

    sinon.assert.calledWith(findOneStub, {
      $or: [
        {
          $and: [
            { field1: { $regex: "PLK", $options: "i" } },
            { field2: { $regex: "Faut pas", $options: "i" } },
          ],
        },
        {
          url: { $regex: "url", $options: "i" },
        },
      ],
    });
  });

  it("Should create recommendation", async () => {
    findOneStub.resolves(null);
    const expected = {
      save: sinon.stub().resolvesThis(),
    };

    createStub.resolves(expected);
    addCreditStub.resolvesThis();

    const result = await create({
      body: {
        field1: "field1",
        field2: "field2",
        field3: "field3",
        html: "html",
        url: "https://www.youtube.com",
        requestType: "SONG",
        provider: "provider",
      },
      user: { _id: "userId" },
    });

    expect(result).toBeDefined();
    expect(result).toEqual(expected);

    sinon.assert.calledOnce(addCreditStub);
    sinon.assert.calledWith(addCreditStub, 1, { _id: "userId" });

    sinon.assert.calledOnce(findOneStub);
  });
});
