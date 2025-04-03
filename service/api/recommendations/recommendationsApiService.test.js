const sinon = require("sinon");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const purchaseService = require("../../market/purchaseService");
const embedService = require("../../embed/embedService");

const openlibraryService = require("../../recommendations/openlibraryService");
const soundcloudService = require("../../embed/soundcloudService");
const deezerService = require("../../embed/deezerService");

const {
  get,
  getFromEmbed,
  create,
  search,
  like,
  unlike,
  getProviders,
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
  let openlibraryServiceStub;
  let soundcloudServiceStub;
  let deezerServiceStub;

  beforeEach(() => {
    openlibraryServiceStub = sinon.stub(openlibraryService, "search");
    soundcloudServiceStub = sinon.stub(soundcloudService, "search");
    deezerServiceStub = sinon.stub(deezerService, "search");
  });

  afterEach(() => {
    openlibraryServiceStub.restore();
    soundcloudServiceStub.restore();
    deezerServiceStub.restore();
  });

  it("Should return books recommendations from open library", async () => {
    const expected = sinon.mock();

    openlibraryServiceStub.resolves(expected);

    const result = await search({
      query: {
        requestType: "BOOK",
        search: "search",
        pageSize: 5,
      },
    });

    expect(result).toEqual(expected);

    sinon.assert.calledOnce(openlibraryServiceStub);
    sinon.assert.calledWith(openlibraryServiceStub, "search", 5);
  });

  it("Should return song recommendations from deezer", async () => {
    const expected = sinon.mock();

    deezerServiceStub.resolves(expected);

    const result = await search({
      query: {
        requestType: "SONG",
        search: "search",
        pageSize: 5,
      },
    });

    expect(result).toEqual(expected);

    sinon.assert.calledOnce(deezerServiceStub);
    sinon.assert.calledWith(deezerServiceStub, "search", 5);
  });

  it("Should return song recommendations from soundcloud", async () => {
    const expected = sinon.mock();

    soundcloudServiceStub.resolves(expected);

    const result = await search({
      query: {
        requestType: "SONG",
        provider: "SOUNDCLOUD",
        search: "search",
        pageSize: 5,
      },
    });

    expect(result).toEqual(expected);

    sinon.assert.calledOnce(soundcloudServiceStub);
    sinon.assert.calledWith(soundcloudServiceStub, "search", 5);
  });
});

describe("Should validate getProviders", () => {
  let checkPurchaseAvailabilityStub;
  beforeEach(() => {
    checkPurchaseAvailabilityStub = sinon.stub(
      purchaseService,
      "checkPurchaseAvailability"
    );
  });

  afterEach(() => {
    checkPurchaseAvailabilityStub.restore();
  });

  it("Should throw error on missing requestType", async () => {
    await expect(
      getProviders({
        query: {},
      })
    ).rejects.toThrow("Request type not supported");
  });

  it("Should return song providers with only default", async () => {
    checkPurchaseAvailabilityStub.resolves(false);
    const results = await getProviders({ query: { requestType: "SONG" } });

    expect(results).toBeDefined();
    expect(results.length).toBe(2);

    expect(results[0].name).toBe("DEEZER");
    expect(results[0].default).toBe(true);
    expect(results[0].available).toBe(true);

    expect(results[1].name).toBe("SOUNDCLOUD");
    expect(results[1].default).toBe(false);
    expect(results[1].available).toBe(false);
  });

  it("Should return song providers with default and available", async () => {
    checkPurchaseAvailabilityStub.resolves(true);
    const results = await getProviders({ query: { requestType: "SONG" } });

    expect(results).toBeDefined();
    expect(results.length).toBe(2);

    expect(results[0].name).toBe("DEEZER");
    expect(results[0].default).toBe(true);
    expect(results[0].available).toBe(true);

    expect(results[1].name).toBe("SOUNDCLOUD");
    expect(results[1].default).toBe(false);
    expect(results[1].available).toBe(true);
  });
  it("Should return book providers with only default", async () => {
    checkPurchaseAvailabilityStub.resolves(false);
    const results = await getProviders({ query: { requestType: "BOOK" } });

    expect(results).toBeDefined();
    expect(results.length).toBe(2);

    expect(results[0].name).toBe("OPENLIBRARY");
    expect(results[0].default).toBe(true);
    expect(results[0].available).toBe(true);

    expect(results[1].name).toBe("GOOGLEBOOKS");
    expect(results[1].default).toBe(false);
    expect(results[1].available).toBe(false);
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
