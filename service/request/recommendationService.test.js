const { NotFoundError } = require("../../errors/error");
const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");
const recommendationService = require("./recommendationService");
const sinon = require("sinon");
const creditService = require("../market/creditService");
const { ObjectId } = require("mongodb");

describe("Test getRecommendation function", () => {
  let recommendationStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findById");
  });
  afterEach(() => {
    recommendationStub.restore();
  });

  it("Should throw a NotFoundError", async () => {
    recommendationStub.returns({
      populate: sinon
        .stub()
        .withArgs("author")
        .returns({
          exec: sinon.stub().resolves(null),
        }),
    });

    await expect(
      recommendationService.getRecommendation({
        recommendationId: "6638fee1d4a68803bfdc7539",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return a recommendation", async () => {
    const expected = {
      toJSON: jest.fn(),
      likes: ["123", "678"],
    };
    recommendationStub.returns({
      populate: sinon
        .stub()
        .withArgs("author")
        .returns({
          exec: sinon.stub().resolves(expected),
        }),
    });

    const result = await recommendationService.getRecommendation("123");

    expect(result).toBeDefined();
    expect(result.liked).toEqual(false);

    expect(expected.toJSON).toHaveBeenCalled();
  });
});

describe("Test createRecommendation function", () => {
  let requestStub;
  let recommendationStub;
  let creditServiceStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "findById");
    recommendationStub = sinon.stub(Recommendation.prototype, "save");
    creditServiceStub = sinon.stub(creditService, "removeCredit");
  });

  afterEach(() => {
    requestStub.restore();
    recommendationStub.restore();
    creditServiceStub.restore();
  });

  it("Should throw a NotFoundError", async () => {
    requestStub.resolves(null);

    await expect(
      recommendationService.createRecommendation({
        requestId: "123",
        data: {},
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow("Request not found");
  });

  it("Should throw a Forbidden", async () => {
    requestStub.resolves({
      author: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    await expect(
      recommendationService.createRecommendation({
        requestId: "123",
        data: {},
        authenticatedUser: {
          _id: "65df6cc757b41fec4d7c3055",
        },
      })
    ).rejects.toThrow(
      "User cannot create a recommendation for his own request"
    );
  });

  it("Should prevent save", async () => {
    requestStub.resolves({
      author: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    creditServiceStub.throws();
    await expect(
      recommendationService.createRecommendation({
        requestId: "123",
        data: {
          field1: "field1",
          field2: "field2",
          field3: "field3",
        },
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow();

    // Verify credit was called
    sinon.assert.calledWith(creditServiceStub, 5, { _id: "678" });

    sinon.assert.notCalled(recommendationStub);
  });

  it("Should create a recommendation", async () => {
    requestStub.resolves({
      _id: "123",
      author: new ObjectId("65df6cc757b41fec4d7c3055"),
      requestType: "BOOK",
    });

    const expected = {
      toJSON: jest.fn(),
    };
    recommendationStub.resolves(expected);
    const result = await recommendationService.createRecommendation({
      requestId: "123",
      data: {
        field1: "field1",
        field2: "field2",
        field3: "field3",
      },
      authenticatedUser: {
        _id: "678",
      },
    });

    expect(result).toBeDefined();
    expect(result.liked).toEqual(false);

    sinon.assert.calledOnce(recommendationStub);
    const savedArgs = recommendationStub.getCall(0).thisValue;

    expect(savedArgs.field1).toEqual("field1");
    expect(savedArgs.field2).toEqual("field2");
    expect(savedArgs.field3).toEqual("field3");
    expect(savedArgs.requestType).toEqual("BOOK");

    // Verify credit was called
    sinon.assert.calledWith(creditServiceStub, 5, { _id: "678" });

    expect(expected.toJSON).toHaveBeenCalled();
  });
});

describe("Test updateRecommendation function", () => {
  let recommendationStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findOneAndUpdate");
  });
  afterEach(() => {
    recommendationStub.restore();
  });

  it("Should throw a NotFoundError", async () => {
    recommendationStub.resolves(null);

    await expect(
      recommendationService.updateRecommendation({
        requestId: "123",
        recommendationId: "456",
        data: {},
        authenticatedUser: { _id: "userId" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return updated recommendation", async () => {
    const expected = {
      isLikedBy: sinon.stub().returns(false),
      toJSON: sinon.stub().returnsThis(),
    };
    recommendationStub.resolves(expected);

    const result = await recommendationService.updateRecommendation({
      requestId: "123",
      recommendationId: "456",
      data: {
        field1: "field1",
        field2: "field2",
        field3: "field3",
      },
      authenticatedUser: {
        _id: "65df6cc757b41fec4d7c3055",
      },
    });

    expect(result).toBeDefined();
    sinon.assert.calledWith(
      recommendationStub,
      {
        _id: "456",
        user: "65df6cc757b41fec4d7c3055",
        request: "123",
      },
      {
        field1: "field1",
        field2: "field2",
        field3: "field3",
      },
      { new: true }
    );

    expect(result.liked).toEqual(false);
  });
});

describe("Test deleteRecommendation function", () => {
  let recommendationStub;
  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findOneAndDelete");
  });
  afterEach(() => {
    recommendationStub.restore();
  });

  it("Should throw a NotFoundError", async () => {
    recommendationStub.resolves(null);

    await expect(
      recommendationService.deletedRecommendation("123", "456", {
        _id: "userId",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should delete recommendation", async () => {
    recommendationStub.resolves({});

    await recommendationService.deletedRecommendation("123", "456", {
      _id: "userId",
    });

    sinon.assert.calledWith(recommendationStub, {
      _id: String("456"),
      user: "userId",
      request: "123",
    });
  });
});
