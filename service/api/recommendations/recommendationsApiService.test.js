const sinon = require("sinon");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const purchaseService = require("../../market/purchaseService");

const openlibraryService = require("../../recommendations/openlibraryService");
const soundcloudService = require("../../embed/soundcloudService");
const deezerService = require("../../embed/deezerService");

const {
  get,
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
