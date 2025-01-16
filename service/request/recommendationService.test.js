const { NotFoundError, ForbiddenError } = require("../../errors/error");
const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");
const recommendationService = require("./recommendationService");
const sinon = require("sinon");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");
const { ObjectId } = require("mongodb");
const { remove } = require("lodash");

describe("Test getRecommendations function", () => {
  let recommendationStub;
  let countDocumentsStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "aggregate");
    countDocumentsStub = sinon.stub(Recommendation, "countDocuments");
  });
  afterEach(() => {
    recommendationStub.restore();
    countDocumentsStub.restore();
  });

  it("Should return a list of recommendations with no logged user", async () => {
    const expected = {
      _id: "1",
      request: {
        _id: "123",
      },
      field1: "field1",
      field2: "field2",
      field3: "field3",
      created_at: new Date(),
      user: [
        {
          _id: "123",
          name: "name",
        },
      ],
    };

    recommendationStub.returns({
      exec: sinon.stub().resolves([expected]),
    });
    countDocumentsStub.resolves(8);

    const result = await recommendationService.getRecommendations({
      requestId: "6638fee1d4a68803bfdc7539",
      sorted: "likes",
      pageSize: 10,
      pageNumber: 1,
    });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.totalResults).toEqual(8);

    expect(result.results).toBeDefined;
    expect(result.results.length).toEqual(1);

    // How pretentious haha
    sinon.assert.calledWith(recommendationStub, [
      {
        $addFields: {
          liked: { $in: [undefined, "$likes"] },
          likesCount: { $size: "$likes" },
        },
      },
      {
        $match: { request: new ObjectId("6638fee1d4a68803bfdc7539") },
      },
      {
        $sort: { likesCount: -1 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);
  });

  it("Should return a list of recommendations with a logged user", async () => {
    const expected = {
      _id: "1",
      request: {
        _id: "123",
      },
      user: [
        {
          _id: "123",
          name: "name",
        },
      ],
      field1: "field1",
      field2: "field2",
      field3: "field3",
      created_at: new Date(),
    };

    recommendationStub.returns({
      exec: sinon.stub().resolves([expected]),
    });
    countDocumentsStub.resolves(8);

    const result = await recommendationService.getRecommendations({
      requestId: "6638fee1d4a68803bfdc7539",
      sorted: "likes",
      pageSize: 10,
      pageNumber: 1,
      authenticatedUser: { _id: "123" },
    });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toEqual(1);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.totalResults).toEqual(8);

    expect(result.results).toBeDefined;
    expect(result.results.length).toEqual(1);

    // How pretentious haha
    sinon.assert.calledWith(recommendationStub, [
      {
        $addFields: {
          liked: { $in: ["123", "$likes"] },
          likesCount: { $size: "$likes" },
        },
      },
      {
        $match: { request: new ObjectId("6638fee1d4a68803bfdc7539") },
      },
      {
        $sort: { likesCount: -1 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);
  });
});

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
      likes: ["65df6cc757b41fec4d7c3055"],
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

describe("Test likeRecommendation function", () => {
  let recommendationStub;
  let creditServiceStub;
  let notificationServiceStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findById");
    creditServiceStub = sinon.stub(creditService, "addCredit");
    notificationServiceStub = sinon.stub(
      notificationService,
      "createNotification"
    );
  });
  afterEach(() => {
    recommendationStub.restore();
    creditServiceStub.restore();
    notificationServiceStub.restore();
  });

  it("Should thrown a recommendation not found error", async () => {
    recommendationStub.returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(null),
        }),
    });

    await expect(
      recommendationService.likeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "userId" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should thrown a already like forbidden error", async () => {
    recommendationStub.returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            likes: ["userId"],
          }),
        }),
    });

    await expect(
      recommendationService.likeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "userId" },
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should thrown an own recommendation forbidden error", async () => {
    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            likes: ["anotherUserId"],
            user: {
              _id: new ObjectId("65df6cc757b41fec4d7c3055"),
            },
          }),
        }),
    });

    await expect(
      recommendationService.likeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "65df6cc757b41fec4d7c3055" },
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should thrown a request not found error", async () => {
    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            _id: "123",
            likes: ["anotherUserId"],
            user: {
              _id: new ObjectId("65df6cc757b41fec4d7c3055"),
            },
          }),
        }),
    });
    await expect(
      recommendationService.likeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "userId" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should add a like with random author", async () => {
    const expected = {
      _id: "123",
      likes: ["anotherUserId"],
      user: {
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis(),
    };

    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(expected),
        }),
    });

    creditServiceStub.resolves();
    notificationServiceStub.resolves();

    const result = await recommendationService.likeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "userId",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(creditServiceStub);
    sinon.assert.calledWith(creditServiceStub, 1, {
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    sinon.assert.calledOnce(notificationServiceStub);
    // sinon.assert.calledWith(notificationServiceStub, {
    //   to: new ObjectId("666666666666"),
    //   from: new ObjectId("678354154"),
    //   type: "like_recommendation",
    // });

    expect(result.likes.length).toEqual(2);
    expect(result.likes[1]).toEqual("userId");
    expect(result.liked).toEqual(true);
    // expect(result.save).toHaveBeenCalled();
  });

  it("Should add a like with request author", async () => {
    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            _id: "123",
            likes: ["anotherUserId"],
            user: {
              _id: new ObjectId("65df6cc757b41fec4d7c3055"),
            },
            request: {
              _id: "requestId",
              author: {
                _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
              },
            },
            save: sinon.stub().resolvesThis(),
            toJSON: sinon.stub().returnsThis(),
          }),
        }),
    });

    creditServiceStub.resolves();
    notificationServiceStub.resolves();

    const result = await recommendationService.likeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "64dc8e5b6f16b11238c6f9a0",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(creditServiceStub);
    sinon.assert.calledWith(creditServiceStub, 5, {
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    sinon.assert.calledOnce(notificationServiceStub);

    expect(result.likes.length).toEqual(2);
    expect(result.likes[1]).toEqual("64dc8e5b6f16b11238c6f9a0");
    expect(result.liked).toEqual(true);
  });
});

describe("Test unlikeRecommendation function", () => {
  let recommendationStub;
  let removeCreditStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findById");
    removeCreditStub = sinon.stub(creditService, "removeCredit");
  });

  afterEach(() => {
    recommendationStub.restore();
    removeCreditStub.restore();
  });

  it("Should thrown a not found error", async () => {
    recommendationStub.returns({
      populate: sinon.stub().returns({
        exec: sinon.stub().resolves(null),
      }),
    });

    await expect(
      recommendationService.unlikeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should throw an error because user has not liked the recommendation", async () => {
    const expected = {
      _id: "123",
      likes: [],
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
    };

    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(expected),
        }),
    });

    await expect(
      recommendationService.unlikeRecommendation({
        recommendationId: "123",
        authenticatedUser: {
          _id: "userId",
        },
      })
    ).rejects.toThrow("User userId has not liked recommendation 123");
  });

  it("Should unlike a recommendation by a random user", async () => {
    const expected = {
      _id: "123",
      likes: ["userId"],
      user: {
        balance: 50,
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      populate: sinon.stub().resolvesThis(),
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis(),
    };

    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves(expected),
        }),
    });

    removeCreditStub.resolves();

    const result = await recommendationService.unlikeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "userId",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 1, {
      balance: 50,
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    expect(result.likes.length).toEqual(0);
    expect(result.liked).toEqual(false);
  });

  it("Should unlike a recommendation made by the request author", async () => {
    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            _id: "123",
            likes: ["64dc8e5b6f16b11238c6f9a0"],
            user: {
              balance: 50,
              _id: new ObjectId("65df6cc757b41fec4d7c3055"),
            },
            request: {
              _id: "requestId",
              author: {
                _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
              },
            },
            populate: sinon.stub().resolvesThis(),
            save: sinon.stub().resolvesThis(),
            toJSON: sinon.stub().returnsThis(),
          }),
        }),
    });

    removeCreditStub.resolves();

    const result = await recommendationService.unlikeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "64dc8e5b6f16b11238c6f9a0",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 5, {
      balance: 50,
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    expect(result.likes.length).toEqual(0);
    expect(result.liked).toEqual(false);
  });
  it("Should unlike a recommendation made by the request author but with no enough balance", async () => {
    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            _id: "123",
            likes: ["64dc8e5b6f16b11238c6f9a0"],
            user: {
              balance: 4,
              _id: new ObjectId("65df6cc757b41fec4d7c3055"),
            },
            request: {
              _id: "requestId",
              author: {
                _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
              },
            },
            populate: sinon.stub().resolvesThis(),
            save: sinon.stub().resolvesThis(),
            toJSON: sinon.stub().returnsThis(),
          }),
        }),
    });

    removeCreditStub.resolves();

    const result = await recommendationService.unlikeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "64dc8e5b6f16b11238c6f9a0",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 4, {
      balance: 4,
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    expect(result.likes.length).toEqual(0);
    expect(result.liked).toEqual(false);
  });
});
