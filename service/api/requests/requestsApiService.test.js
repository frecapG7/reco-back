const Request = require("../../../model/Request");
const recommendationsService = require("../../recommendations/recommendationsService");
const recommendationsServiceV2 = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");
const sinon = require("sinon");
const {
  getRecommendations,
  createRecommendation,
} = require("./requestsApiService");

describe("Should validate getRecommendations", () => {
  let requestStub;
  let searchRecommendationsStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "findById");
    searchRecommendationsStub = sinon.stub(
      recommendationsService,
      "searchRecommendations"
    );
  });

  afterEach(() => {
    requestStub.restore();
    searchRecommendationsStub.restore();
  });

  it("Should throw error on request not found", async () => {
    requestStub.resolves(null);

    await expect(
      getRecommendations({ params: { requestId: "1234" } })
    ).rejects.toThrow("Request not found");
  });

  it("Should return recommendations with default values", async () => {
    requestStub.resolves({ _id: "1234" });
    searchRecommendationsStub.resolves({});

    const result = await getRecommendations({ params: { requestId: "1234" } });

    expect(result).toEqual({});
    sinon.assert.calledOnce(searchRecommendationsStub);
    sinon.assert.calledWith(searchRecommendationsStub, {
      request: { _id: "1234" },
      authenticatedUser: undefined,
      showDuplicates: true,
      pageNumber: 1,
      pageSize: 5,
    });
  });

  it("Should return recommendations with values", async () => {
    requestStub.resolves({ _id: "1234" });
    searchRecommendationsStub.resolves({});

    const result = await getRecommendations({
      params: { requestId: "1234" },
      query: {
        pageNumber: 5,
        pageSize: 50,
      },
    });

    expect(result).toEqual({});
    sinon.assert.calledOnce(searchRecommendationsStub);
    sinon.assert.calledWith(searchRecommendationsStub, {
      request: { _id: "1234" },
      authenticatedUser: undefined,
      showDuplicates: true,
      pageNumber: 5,
      pageSize: 50,
    });
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
