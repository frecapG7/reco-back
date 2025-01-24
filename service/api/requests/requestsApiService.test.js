const { NotFoundError } = require("../../../errors/error");
const Request = require("../../../model/Request");
const recommendationsService = require("../../recommendations/recommendationsService");

const sinon = require("sinon");
const { getRecommendations } = require("./requestsApiService");

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

    await expect(getRecommendations({ requestId: "1234" })).rejects.toThrow(
      "Request not found"
    );
  });

  it("Should return recommendations with default values", async () => {
    requestStub.resolves({ _id: "1234" });
    searchRecommendationsStub.resolves({});

    const result = await getRecommendations({ requestId: "1234" });

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
});
