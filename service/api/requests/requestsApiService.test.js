const Request = require("../../../model/Request");
const Recommendation = require("../../../model/Recommendation");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");
const sinon = require("sinon");
const {
  getRequest,
  createRequest,
  getRecommendations,
  createRecommendation,
} = require("./requestsApiService");

describe("Should validate get", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Request, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw error on request not found", async () => {
    findByIdStub.resolves(null);

    await expect(getRequest({ params: { id: "1234" } })).rejects.toThrow(
      "Request not found"
    );
  });

  it("Should return request", async () => {
    const request = {
      _id: "1234",
      toJSON: sinon.stub().resolvesThis(),
      populate: sinon.stub().withArgs("author").resolvesThis(),
    };

    findByIdStub.resolves(request);

    const result = await getRequest({ params: { id: "1234" } });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(request.populate);
    sinon.assert.calledWith(request.populate, "author");
  });
});

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

  // it("Should create request", async () => {
  //   const user = sinon.mock();
  //   const expected = sinon.mock();
  //   saveStub.resolves(expected);

  //   const result = await createRequest({
  //     body: {
  //       requestType: "SONG",
  //       title: "title",
  //       description: "<p>description</p>",
  //       tags: ["tag1", "tag2"],
  //     },
  //     user,
  //   });

  //   expect(result).toBeDefined();

  //   // expect(result.requestType).toBe("SONG");
  //   // expect(result.title).toBe("title");
  //   // expect(result.description).toBe("<p>description</p>");
  //   // expect(result.tags).toEqual(["tag1", "tag2"]);

  //   sinon.assert.calledOnce(saveStub);
  // });
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
  let removeCreditStub;
  let saveStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Request, "findById");
    removeCreditStub = sinon.stub(creditService, "removeCredit");
    saveStub = sinon.stub(Recommendation.prototype, "save");
  });

  afterEach(() => {
    findByIdStub.restore();
    removeCreditStub.restore();
    saveStub.restore();
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
    ).rejects.toThrow("You need to provide a duplicated_from recommendation");
  });

  it("Should create recommendation", async () => {
    const user = sinon.stub();
    const request = sinon.stub();

    request.save = sinon.stub().resolvesThis();

    findByIdStub.withArgs("123").resolves(request);

    saveStub.resolvesThis();
    removeCreditStub.resolves({});

    const result = await createRecommendation({
      params: { requestId: "123" },
      body: {
        field1: "field1",
        field2: "field2",
        duplicate_from: "1234",
        requestType: "SONG",
      },
      user,
    });

    expect(result).toBeDefined();

    expect(result.field1).toBe("field1");
    expect(result.field2).toBe("field2");
    expect(result.requestType).toBe("SONG");

    sinon.assert.calledOnce(saveStub);

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 5, user);
  });
});
