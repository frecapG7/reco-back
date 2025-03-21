const Request = require("../../model/Request");
const Recommendation = require("../../model/Recommendation");
const PurchaseItem = require("../../model/purchase/PurchaseItem");

const sinon = require("sinon");
const { getMetrics, getBalance } = require("./userMetricsService");

describe("Test  getMetrics", () => {
  let requestStub;
  let recommendationStub;
  let aggregateStub;

  let purchaseFindOneStub;
  let purchaseAggregateStub;
  let purchasesCountDocumentsStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "countDocuments");
    recommendationStub = sinon.stub(Recommendation, "countDocuments");
    aggregateStub = sinon.stub(Recommendation, "aggregate");

    purchaseFindOneStub = sinon.stub(PurchaseItem, "findOne");
    purchaseAggregateStub = sinon.stub(PurchaseItem, "aggregate");
    purchasesCountDocumentsStub = sinon.stub(PurchaseItem, "countDocuments");
  });

  afterEach(() => {
    requestStub.restore();
    recommendationStub.restore();
    aggregateStub.restore();

    purchaseFindOneStub.restore();
    purchaseAggregateStub.restore();
    purchasesCountDocumentsStub.restore();
  });

  it("Should return metrics with no likes", async () => {
    const user = sinon.mock();

    // Request stub
    requestStub.withArgs({ author: user }).resolves(1);
    requestStub.withArgs({ author: user, requestType: "BOOK" }).resolves(2);
    requestStub.withArgs({ author: user, requestType: "SONG" }).resolves(3);
    requestStub.withArgs({ author: user, requestType: "MOVIE" }).resolves(4);

    // Recommendation stub
    recommendationStub.withArgs({ user }).resolves(2);
    recommendationStub.withArgs({ user, requestType: "BOOK" }).resolves(3);
    recommendationStub.withArgs({ user, requestType: "SONG" }).resolves(4);
    recommendationStub.withArgs({ user, requestType: "MOVIE" }).resolves(5);

    // Likes stub
    recommendationStub.withArgs({ likes: user }).resolves(3);
    aggregateStub
      .withArgs([
        { $match: { user } },
        { $project: { likeCount: { $size: "$likes" } } },
        { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } },
      ])
      .resolves([]);

    // Purchase stub
    purchaseFindOneStub.returns({
      sort: sinon
        .stub()
        .withArgs({ "payment_details.purchased_at": -1 })
        .returns({
          exec: sinon.stub().returns({
            payment_details: {
              price: 15,
              purchased_at: new Date(),
            },
          }),
        }),
    });
    purchaseAggregateStub
      .withArgs([
        { $match: { user } },
        { $group: { _id: null, total: { $sum: "$payment_details.price" } } },
      ])
      .resolves([{ total: 100 }]);
    purchasesCountDocumentsStub.withArgs({ user }).resolves(5);

    const result = await getMetrics(user);

    expect(result).toBeDefined();
    expect(result.requests).toBeDefined();
    expect(result.requests.books).toEqual(2);
    expect(result.requests.songs).toEqual(3);
    expect(result.requests.movies).toEqual(4);
    expect(result.requests.total).toEqual(1);

    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.books).toEqual(3);
    expect(result.recommendations.songs).toEqual(4);
    expect(result.recommendations.movies).toEqual(5);
    expect(result.recommendations.total).toEqual(2);

    expect(result.likes).toBeDefined();
    expect(result.likes.recommendationsLikedCount).toEqual(3);
    expect(result.likes.totalLikes).toEqual(0);

    expect(result.purchases).toBeDefined();
    expect(result.purchases.total).toEqual(5);
    expect(result.purchases.amount).toEqual(100);

    expect(result.purchases.last).toBeDefined();
    expect(result.purchases.last.amount).toEqual(15);
    expect(result.purchases.last.date).toBeDefined();
  });

  it("Should return metrics with likes", async () => {
    const user = sinon.mock();

    // Request stub
    requestStub.withArgs({ author: user }).resolves(1);
    requestStub.withArgs({ author: user, requestType: "BOOK" }).resolves(2);
    requestStub.withArgs({ author: user, requestType: "SONG" }).resolves(3);
    requestStub.withArgs({ author: user, requestType: "MOVIE" }).resolves(4);

    // Recommendation stub
    recommendationStub.withArgs({ user }).resolves(2);
    recommendationStub.withArgs({ user, requestType: "BOOK" }).resolves(3);
    recommendationStub.withArgs({ user, requestType: "SONG" }).resolves(4);
    recommendationStub.withArgs({ user, requestType: "MOVIE" }).resolves(5);

    // Likes stub
    recommendationStub.withArgs({ likes: user }).resolves(3);
    aggregateStub
      .withArgs([
        { $match: { user } },
        { $project: { likeCount: { $size: "$likes" } } },
        { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } },
      ])
      .resolves([{ totalLikes: 4 }]);

    // Purchase stub
    purchaseFindOneStub.returns({
      sort: sinon
        .stub()
        .withArgs({ "payment_details.purchased_at": -1 })
        .returns({
          exec: sinon.stub().returns({
            payment_details: {
              price: 15,
              purchased_at: new Date(),
            },
          }),
        }),
    });
    purchaseAggregateStub
      .withArgs([
        { $match: { user } },
        { $group: { _id: null, total: { $sum: "$payment_details.price" } } },
      ])
      .resolves([{ total: 100 }]);
    purchasesCountDocumentsStub.withArgs({ user }).resolves(5);

    const result = await getMetrics(user);

    expect(result).toBeDefined();

    expect(result.requests).toBeDefined();
    expect(result.requests.books).toEqual(2);
    expect(result.requests.songs).toEqual(3);
    expect(result.requests.movies).toEqual(4);
    expect(result.requests.total).toEqual(1);

    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.books).toEqual(3);
    expect(result.recommendations.songs).toEqual(4);
    expect(result.recommendations.movies).toEqual(5);
    expect(result.recommendations.total).toEqual(2);

    expect(result.likes).toBeDefined();
    expect(result.likes.recommendationsLikedCount).toEqual(3);
    expect(result.likes.totalLikes).toEqual(4);

    expect(result.purchases).toBeDefined();
    expect(result.purchases.total).toEqual(5);
    expect(result.purchases.amount).toEqual(100);

    expect(result.purchases.last).toBeDefined();
    expect(result.purchases.last.amount).toEqual(15);
    expect(result.purchases.last.date).toBeDefined();
  });
});
