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
  like,
  unlike,
} = require("./recommendationsApiService");
const User = require("../../../model/User");

describe("Should validate get", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Recommendation, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw NotFoundError", async () => {
    findByIdStub.returns({
      populate: sinon.stub().returns({
        exec: sinon.stub().resolves(null),
      }),
    });

    await expect(get({ params: { id: "123" } })).rejects.toThrowError(
      "Recommendation not found"
    );
  });

  it("Should return recommendation", async () => {
    const expected = sinon.mock(Recommendation);
    findByIdStub.returns({
      populate: sinon.stub().returns({
        exec: sinon.stub().resolves(expected),
      }),
    });

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
      url: { $regex: "url", $options: "i" },
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

describe("Should test like recommendation", () => {
  let findByIdStub;
  let likeStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Recommendation, "findById");
    likeStub = sinon.stub(recommendationsService, "like");
  });

  afterEach(() => {
    findByIdStub.restore();
    likeStub.restore();
  });

  it("Should throw error on unauthenticated", async () => {
    await expect(
      like({
        params: { id: "123" },
      })
    ).rejects.toThrow("You need to be authenticated to like a recommendation");
  });

  it("Should throw error on not found", async () => {
    findByIdStub.returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(null),
        }),
    });

    await expect(
      like({
        params: { id: "123" },
        user: { _id: "userId" },
      })
    ).rejects.toThrow("Recommendation not found");
  });

  it("Should like recommendation", async () => {
    const recommendation = {
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().resolvesThis({}),
    };
    const user = sinon.mock(User);

    findByIdStub.returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(recommendation),
        }),
    });

    const result = await like({
      params: { id: "123" },
      user,
    });

    expect(result).toBeDefined();

    expect(result.liked).toBeTruthy();
  });
});

describe("Should test unlike recommendation", () => {
  let findByIdStub;
  let unlikeStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Recommendation, "findById");
    unlikeStub = sinon.stub(recommendationsService, "unlike");
  });

  afterEach(() => {
    findByIdStub.restore();
    unlikeStub.restore();
  });

  it("Should throw error on unauthenticated", async () => {
    await expect(
      unlike({
        params: { id: "123" },
      })
    ).rejects.toThrow(
      "You need to be authenticated to unlike a recommendation"
    );
  });

  it("Should throw error on recommendation not found", async () => {
    findByIdStub.returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(null),
        }),
    });

    await expect(
      unlike({
        params: { id: "123" },
        user: { _id: "userId" },
      })
    ).rejects.toThrow("Recommendation not found");
  });

  it("Should unlike recommendation", async () => {
    const recommendation = {
      toJSON: sinon.stub().resolvesThis(),
    };

    findByIdStub.returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(recommendation),
        }),
    });

    unlikeStub.resolves(recommendation);

    const result = await unlike({
      params: { id: "123" },
      user: { _id: "userId" },
    });

    expect(result).toBeDefined();
    expect(result.liked).toBeFalsy();
  });
});
