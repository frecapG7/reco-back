const Recommendation = require("../../model/Recommendation");
const {
  searchRecommendations,
  unlikeRecommendation,
} = require("./recommendationsService");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const sinon = require("sinon");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");
const { ObjectId } = require("mongodb");

describe("Validate searchRecommendations", () => {
  let countStub;
  let findStub;

  beforeEach(() => {
    countStub = sinon.stub(Recommendation, "countDocuments");
    findStub = sinon.stub(Recommendation, "find");
  });
  afterEach(() => {
    countStub.restore();
    findStub.restore();
  });

  it("Should test with default value", async () => {
    countStub.returns(1);
    findStub.returns({
      skip: sinon
        .stub()
        .withArgs(0)
        .returns({
          limit: sinon
            .stub()
            .withArgs(5)
            .returns({
              sort: sinon
                .stub()
                .withArgs({ created_at: -1 })
                .returns({
                  populate: sinon.stub().returns({
                    exec: sinon.stub().returns([
                      {
                        toJSON: sinon.stub().returns({
                          id: "123",
                          field1: "field1",
                          field2: "field2",
                          field3: "field3",
                          html: "html",
                        }),
                        isLikedBy: sinon.stub().returns(false),
                      },
                    ]),
                  }),
                }),
            }),
        }),
    });

    const pageResult = await searchRecommendations({
      requestType: "requestType",
    });

    expect(pageResult.pagination.currentPage).toEqual(1);
    expect(pageResult.pagination.totalPages).toEqual(1);
    expect(pageResult.pagination.totalResults).toEqual(1);

    expect(pageResult.results.length).toEqual(1);
    expect(pageResult.results[0].id).toEqual("123");
    expect(pageResult.results[0].field1).toEqual("field1");
    expect(pageResult.results[0].field2).toEqual("field2");
    expect(pageResult.results[0].field3).toEqual("field3");
    expect(pageResult.results[0].html).toEqual("html");
    expect(pageResult.results[0].liked).toEqual(false);

    sinon.assert.calledWith(findStub, {
      duplicate_from: null,
      $or: [
        { field1: { $regex: "", $options: "i" } },
        { field2: { $regex: "", $options: "i" } },
        { field3: { $regex: "", $options: "i" } },
      ],
      requestType: "requestType",
    });
  });

  it("Should test with all args value", async () => {
    countStub.returns(1);
    findStub.returns({
      skip: sinon
        .stub()
        .withArgs(10)
        .returns({
          limit: sinon
            .stub()
            .withArgs(10)
            .returns({
              sort: sinon
                .stub()
                .withArgs({ created_at: -1 })
                .returns({
                  populate: sinon.stub().returns({
                    exec: sinon.stub().returns([
                      {
                        toJSON: sinon.stub().returns({
                          id: "123",
                          field1: "field1",
                          field2: "field2",
                          field3: "field3",
                          html: "html",
                        }),
                        isLikedBy: sinon.stub().returns(true),
                      },
                    ]),
                  }),
                }),
            }),
        }),
    });

    const user = sinon.mock();

    const pageResult = await searchRecommendations({
      requestType: "requestType",
      search: "search",
      showDuplicates: true,
      user,
      pageSize: 10,
      pageNumber: 2,
    });

    expect(pageResult.pagination.currentPage).toEqual(2);
    expect(pageResult.pagination.totalPages).toEqual(1);
    expect(pageResult.pagination.totalResults).toEqual(1);

    expect(pageResult.results.length).toEqual(1);
    expect(pageResult.results[0].id).toEqual("123");
    expect(pageResult.results[0].field1).toEqual("field1");
    expect(pageResult.results[0].field2).toEqual("field2");
    expect(pageResult.results[0].field3).toEqual("field3");
    expect(pageResult.results[0].html).toEqual("html");
    expect(pageResult.results[0].liked).toEqual(true);

    sinon.assert.calledWith(findStub, {
      $or: [
        { field1: { $regex: "search", $options: "i" } },
        { field2: { $regex: "search", $options: "i" } },
        { field3: { $regex: "search", $options: "i" } },
      ],
      user,
      requestType: "requestType",
    });
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
      unlikeRecommendation({
        recommendationId: "123",
        authenticatedUser: { _id: "678" },
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should throw an error because user has not liked the recommendation", async () => {
    const expected = {
      _id: "123",
      isLikedBy: sinon.stub().returns(false),
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
      unlikeRecommendation({
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
      likes: [new ObjectId("62dc8e5b6f16b11238c6f9a0")],
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
      isLikedBy: sinon.stub().returns(true),
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

    const result = await unlikeRecommendation({
      recommendationId: "123",
      authenticatedUser: {
        _id: "62dc8e5b6f16b11238c6f9a0",
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
            likes: [new ObjectId("64dc8e5b6f16b11238c6f9a0")],
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
            isLikedBy: sinon.stub().returns(true),
            populate: sinon.stub().resolvesThis(),
            save: sinon.stub().resolvesThis(),
            toJSON: sinon.stub().returnsThis(),
          }),
        }),
    });

    removeCreditStub.resolves();

    const result = await unlikeRecommendation({
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
            likes: [new ObjectId("64dc8e5b6f16b11238c6f9a0")],
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
            isLikedBy: sinon.stub().returns(true),
            populate: sinon.stub().resolvesThis(),
            save: sinon.stub().resolvesThis(),
            toJSON: sinon.stub().returnsThis(),
          }),
        }),
    });

    removeCreditStub.resolves();

    const result = await unlikeRecommendation({
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
