const sinon = require("sinon");
const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");

const {
  getStats,
  getRequestsHistory,
  getRecommendationsHistory,
} = require("./usersHistoryService");

describe("Test getStats", () => {
  let requestCountDocumentsStub;
  let recommendationsCountDocumentsStub;

  beforeEach(() => {
    requestCountDocumentsStub = sinon.stub(Request, "countDocuments");
    recommendationsCountDocumentsStub = sinon.stub(
      Recommendation,
      "countDocuments"
    );
  });

  afterEach(() => {
    requestCountDocumentsStub.restore();
    recommendationsCountDocumentsStub.restore();
  });

  it("Should returns stats object", async () => {
    requestCountDocumentsStub.withArgs({ author: "123" }).returns(45);
    recommendationsCountDocumentsStub.withArgs({ user: "123" }).returns(33);

    const result = await getStats({ user: { _id: "123" } });

    expect(result).toBeDefined();
    expect(result.requestsCount).toEqual(45);
    expect(result.recommendationsCount).toEqual(33);
  });
});

describe("Test getRequestsHistory", () => {
  let requestFindStub;

  beforeEach(() => {
    requestFindStub = sinon.stub(Request, "find");
  });

  afterEach(() => {
    requestFindStub.restore();
  });

  it("Should return history with default pageSize", async () => {
    requestFindStub.withArgs({ author: "123" }).returns({
      sort: sinon
        .stub()
        .withArgs({ createdAt: -1 })
        .returns({
          limit: sinon
            .stub()
            .withArgs(5)
            .returns({
              exec: () => [
                {
                  _id: "123",
                },
                {
                  _id: "456",
                },
              ],
            }),
        }),
    });

    const results = await getRequestsHistory({ user: { _id: "123" } });

    expect(results).toBeDefined();
    expect(results.length).toEqual(2);
  });
});

describe("Test getRecommendationsHistory", () => {
  let recommendationsFindStub;

  beforeEach(() => {
    recommendationsFindStub = sinon.stub(Recommendation, "find");
  });

  afterEach(() => {
    recommendationsFindStub.restore();
  });

  it("Should return history with default pageSize", async () => {
    recommendationsFindStub.withArgs({ user: "123" }).returns({
      sort: sinon
        .stub()
        .withArgs({ createdAt: -1 })
        .returns({
          limit: sinon
            .stub()
            .withArgs(5)
            .returns({
              exec: () => [
                {
                  _id: "123",
                },
                {
                  _id: "456",
                },
              ],
            }),
        }),
    });

    const results = await getRecommendationsHistory({ user: { _id: "123" } });

    expect(results).toBeDefined();
    expect(results.length).toEqual(2);
  });

  it("Should return history with pageSize", async () => {
    recommendationsFindStub.withArgs({ user: "123" }).returns({
      sort: sinon
        .stub()
        .withArgs({ createdAt: -1 })
        .returns({
          limit: sinon
            .stub()
            .withArgs(45)
            .returns({
              exec: () => [
                {
                  _id: "123",
                },
                {
                  _id: "456",
                },
              ],
            }),
        }),
    });

    const results = await getRecommendationsHistory({
      user: { _id: "123" },
      pageSize: 45,
    });

    expect(results).toBeDefined();
    expect(results.length).toEqual(2);
  });
});
