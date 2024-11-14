const { mongoose } = require("mongoose");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const Recommendation = require("../../model/Recommendation");
const Request = require("../../model/Request");
const recommendationService = require("./recommendationService");
const sinon = require("sinon");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");
const { ObjectId } = require("mongodb");

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
      toJSON: () => ({
        _id: "1",
        request: {
          _id: "123",
        },
        user: {
          _id: "123",
          name: "name",
        },
        field1: "field1",
        field2: "field2",
        field3: "field3",
        created_at: new Date(),
      }),
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
      toJSON: () => ({
        _id: "1",
        request: {
          _id: "123",
        },
        user: {
          _id: "123",
          name: "name",
        },
        field1: "field1",
        field2: "field2",
        field3: "field3",
        created_at: new Date(),
      }),
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
    expect(result.likesCount).toEqual(2);

    expect(expected.toJSON).toHaveBeenCalled();
  });
});

describe("Test createRecommendation function", () => {
  let requestStub;
  let recommendationStub;
  let creditServiceStub;
  let mongooseStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "findById");
    recommendationStub = sinon.stub(Recommendation.prototype, "save");
    creditServiceStub = sinon.stub(creditService, "removeCredit");
    mongooseStub = sinon.stub(mongoose, "startSession");
  });

  afterEach(() => {
    requestStub.restore();
    recommendationStub.restore();
    creditServiceStub.restore();
    mongooseStub.restore();
  });

  it("Should throw a NotFoundError", async () => {
    requestStub.resolves(null);

    await expect(
      recommendationService.createRecommendation({
        requestId: "123",
        data: {},
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should throw a Forbidden", async () => {
    requestStub.resolves({
      author: new ObjectId("678354154544"),
    });

    await expect(
      recommendationService.createRecommendation({
        requestId: "123",
        data: {},
        authenticatedUser: {
          _id: "678354154544",
        },
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("Should rollback transaction", async () => {
    requestStub.resolves({
      author: new ObjectId("678354154544"),
    });

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongooseStub.resolves(sessionStub);

    recommendationStub.throws();
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

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should create a recommendation", async () => {
    requestStub.resolves({
      _id: "123",
      author: new ObjectId("678354154544"),
      requestType: "BOOK",
    });

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongooseStub.resolves(sessionStub);

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
    expect(result.likesCount).toEqual(0);
    expect(result.liked).toEqual(false);

    sinon.assert.calledOnce(recommendationStub);
    const savedArgs = recommendationStub.getCall(0).thisValue;

    expect(savedArgs.field1).toEqual("field1");
    expect(savedArgs.field2).toEqual("field2");
    expect(savedArgs.field3).toEqual("field3");
    expect(savedArgs.requestType).toEqual("BOOK");

    // Verify credit was called
    sinon.assert.calledWith(creditServiceStub, 5, { _id: "678" });
    expect(sessionStub.startTransaction).toHaveBeenCalled();

    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();

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
    expect(result.likesCount).toEqual(1);
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
  let mongooseStub;
  let creditServiceStub;
  let notificationServiceStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findById");
    mongooseStub = sinon.stub(mongoose, "startSession");
    creditServiceStub = sinon.stub(creditService, "addCredit");
    notificationServiceStub = sinon.stub(
      notificationService,
      "createNotification"
    );
  });
  afterEach(() => {
    recommendationStub.restore();
    mongooseStub.restore();
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
              _id: new ObjectId("678354154544"),
            },
          }),
        }),
    });

    await expect(
      recommendationService.likeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "678354154544" },
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
              _id: new ObjectId("678354154544"),
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

  it("Should rollback transaction", async () => {
    recommendationStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("request", "author")
        .returns({
          exec: sinon.stub().resolves({
            _id: "123",
            likes: ["anotherUserId"],
            user: {
              _id: new ObjectId("678354154544"),
            },
            request: {
              _id: "requestId",
            },
            save: jest.fn(),
          }),
        }),
    });

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    creditServiceStub.throws();

    await expect(
      recommendationService.likeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "userId" },
      })
    ).rejects.toThrow();

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should add a like with random author", async () => {
    const expected = {
      _id: "123",
      likes: ["anotherUserId"],
      user: {
        _id: new ObjectId("678354154544"),
      },
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("666666666666"),
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

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);
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
      _id: new ObjectId("678354154544"),
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

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
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
              _id: new ObjectId("678354154544"),
            },
            request: {
              _id: "requestId",
              author: {
                _id: new ObjectId("666666666666"),
              },
            },
            save: sinon.stub().resolvesThis(),
            toJSON: sinon.stub().returnsThis(),
          }),
        }),
    });

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);
    creditServiceStub.resolves();
    notificationServiceStub.resolves();

    const result = await recommendationService.likeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "666666666666",
      },
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(creditServiceStub);
    sinon.assert.calledWith(creditServiceStub, 5, {
      _id: new ObjectId("678354154544"),
    });

    sinon.assert.calledOnce(notificationServiceStub);

    expect(result.likes.length).toEqual(2);
    expect(result.likes[1]).toEqual("666666666666");
    expect(result.liked).toEqual(true);

    //Verify transaction
    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });
});

describe("Test unlikeRecommendation function", () => {
  let recommendationStub;
  let mongooseStub;

  beforeEach(() => {
    recommendationStub = sinon.stub(Recommendation, "findById");
    mongooseStub = sinon.stub(mongoose, "startSession");
  });

  afterEach(() => {
    recommendationStub.restore();
    mongooseStub.restore();
  });

  it("Should thrown a not found error", async () => {
    recommendationStub.resolves(null);

    await expect(
      recommendationService.unlikeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should rollback transaction", async () => {
    const expected = {
      like: ["123"],
      save: sinon.stub().resolvesThis(),
    };

    recommendationStub.resolves(expected);

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    await expect(
      recommendationService.unlikeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow();

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
    expect(sessionStub.abortTransaction).toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();
  });

  it("Should unlike recommendation", async () => {
    const expected = {
      likes: ["123", "678"],
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis(),
    };

    recommendationStub.resolves(expected);

    const sessionStub = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongooseStub.resolves(sessionStub);

    const result = await recommendationService.unlikeRecommendation({
      recommendationId: "123",
      authenticatedUser: { _id: "678" },
    });

    expect(sessionStub.startTransaction).toHaveBeenCalled();
    expect(sessionStub.commitTransaction).toHaveBeenCalled();
    expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
    expect(sessionStub.endSession).toHaveBeenCalled();

    expect(result.likes.length).toEqual(1);
    expect(result.likes[0]).toEqual("123");
  });
});
