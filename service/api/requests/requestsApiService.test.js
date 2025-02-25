const Request = require("../../../model/Request");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");
const sinon = require("sinon");
const {
  createRequest,
  getRecommendations,
  createRecommendation,
} = require("./requestsApiService");

describe("Should validate createRequest", () => {
  let saveStub = sinon.stub(Request.prototype, "save");

  beforeEach(() => {
    saveStub.reset();
  });
  afterEach(() => {
    saveStub.restore();
  });

  it("Should throw error on user not authenticated", async () => {
    await expect(createRequest({ body: {} })).rejects.toThrow(
      "You need to be authenticated to create a request"
    );
  });

  it("Should create request", async () => {
    saveStub.resolvesThis();

    const result = await createRequest({
      body: {
        requestType: "SONG",
        title: "title",
        description: "<p>description</p>",
        tags: ["tag1", "tag2"],
      },
      user: {
        _id: "1234",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(saveStub);
  });
});

describe("Should validate getRecommendations", () => {
  let requestStub;
  let paginatedSearchStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "findById");
    paginatedSearchStub = sinon.stub(
      recommendationsServiceV2,
      "paginatedSearch"
    );
  });

  afterEach(() => {
    requestStub.restore();
    paginatedSearchStub.restore();
  });

  it("Should throw error on request not found", async () => {
    requestStub.resolves(null);

    await expect(
      getRecommendations({ params: { requestId: "1234" } })
    ).rejects.toThrow("Request not found");
  });

  it("Should return recommendations with default values", async () => {
    const expectedRecommendation = {
      _id: "1234",
      isLikedBy: sinon.stub(),
      toJSON: sinon.stub(),
      populate: sinon.stub(),
    };

    requestStub.resolves({ _id: "1234" });
    paginatedSearchStub.resolves({
      pagination: { pageNumber: 1, pageSize: 5 },
      results: [expectedRecommendation],
    });

    const result = await getRecommendations({ params: { requestId: "1234" } });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();

    sinon.assert.calledOnce(paginatedSearchStub);
    sinon.assert.calledWith(paginatedSearchStub, {
      request: { _id: "1234" },
      showDuplicates: true,
      pageNumber: 1,
      pageSize: 5,
    });
  });

  it("Should return recommendations with values", async () => {
    const expectedRecommendation = {
      _id: "1234",
      isLikedBy: sinon.stub().returns(true),
      toJSON: sinon.stub(),
      populate: sinon.stub(),
    };

    requestStub.resolves({ _id: "1234" });
    paginatedSearchStub.resolves({
      pagination: {},
      results: [expectedRecommendation],
    });

    const result = await getRecommendations({
      params: { requestId: "1234" },
      query: {
        pageNumber: 5,
        pageSize: 50,
      },
    });

    expect(result).toBeDefined();
    sinon.assert.calledOnce(paginatedSearchStub);
    sinon.assert.calledWith(paginatedSearchStub, {
      request: { _id: "1234" },
      showDuplicates: true,
      pageNumber: 5,
      pageSize: 50,
    });

    expect(result.pagination).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results[0].liked).toBeTruthy();
  });
});

describe("Should validate createRecommendation", () => {
  let findByIdStub;
  let createStub;
  let removeCreditStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Request, "findById");
    createStub = sinon.stub(recommendationsServiceV2, "create");
    removeCreditStub = sinon.stub(creditService, "removeCredit");
  });

  afterEach(() => {
    findByIdStub.restore();
    createStub.restore();
    removeCreditStub.restore();
  });

  it("Should throw error on user not authenticated", async () => {
    await expect(
      createRecommendation({ params: { requestId: "123" }, body: {} })
    ).rejects.toThrow(
      "You need to be authenticated to create a recommendation"
    );
  });

  it("Should throw error on request not found", async () => {
    const user = sinon.stub();
    findByIdStub.withArgs("123").resolves(null);

    await expect(
      createRecommendation({ params: { requestId: "123" }, body: {}, user })
    ).rejects.toThrow("Request not found");
  });

  it("Should throw error on duplicated_from not provided", async () => {
    const user = sinon.stub();
    const request = sinon.stub();

    findByIdStub.withArgs("123").resolves(request);

    await expect(
      createRecommendation({ params: { requestId: "123" }, body: {}, user })
    ).rejects.toThrow("Should we allow new recommendations creation here ?");
  });

  it("Should create recommendation", async () => {
    const user = sinon.stub();
    const request = sinon.stub();

    findByIdStub.withArgs("123").resolves(request);

    createStub.resolves({ save: sinon.stub().resolvesThis() });
    removeCreditStub.resolves({});

    const result = await createRecommendation({
      params: { requestId: "123" },
      body: { duplicated_from: "1234" },
      user,
    });

    expect(result).toBeDefined();
    sinon.assert.calledOnce(createStub);
    sinon.assert.calledWith(createStub, {
      duplicated_from: "1234",
      request,
      user,
    });

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 5, user);
  });
});
