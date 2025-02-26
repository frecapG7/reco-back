const sinon = require("sinon");
const Recommendation = require("../../model/Recommendation");
const creditService = require("../market/creditService");
const notificationService = require("../user/notificationService");
const { ObjectId } = require("mongodb");
const {
  create,
  paginatedSearch,
  like,
  unlike,
} = require("./recommendationsServiceV2");
const { populate } = require("../../model/Request");

describe("Should test create recommendation", () => {
  let saveStub;

  beforeEach(() => {
    saveStub = sinon.stub(Recommendation.prototype, "save");
  });
  afterEach(() => {
    saveStub.restore();
  });

  it("Should throw error on forbidden url", async () => {
    await expect(
      create({
        url: "https://www.google.com",
      })
    ).rejects.toThrow("Url not accepted");
  });

  it("Should create recommendation", async () => {
    saveStub.resolvesThis();

    const result = await create({
      field1: "field1",
      field2: "field2",
      field3: "field3",
      html: "html",
      url: "https://www.youtube.com",
      requestType: "SONG",
      provider: "provider",
      user: { _id: "userId" },
      request: { _id: "requestId" },
    });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Recommendation);
    expect(result.field1).toBe("field1");
    expect(result.field2).toBe("field2");
    expect(result.field3).toBe("field3");
    expect(result.html).toBe("html");
    expect(result.url).toBe("https://www.youtube.com");
    expect(result.requestType).toBe("SONG");
    // expect(result.user).toEqual({ _id: "userId" });
    // expect(result.request).toEqual({ _id: "requestId" });
  });
});

describe("Should test paginated search", () => {
  let countDocumentsStub;
  let findStub;

  beforeEach(() => {
    countDocumentsStub = sinon.stub(Recommendation, "countDocuments");
    findStub = sinon.stub(Recommendation, "find");
  });

  afterEach(() => {
    countDocumentsStub.restore();
    findStub.restore();
  });

  it("Should return paginated search based on default values", async () => {
    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("user title avatar name")
        .returns({
          populate: sinon
            .stub()
            .withArgs("duplicated_from html url")
            .returns({
              exec: sinon.stub().resolves([]),
            }),
        }),
    });
    countDocumentsStub.resolves(50);

    const result = await paginatedSearch({
      requestType: "SONG",
    });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(10);
    expect(result.pagination.totalResults).toBe(50);
    expect(result.results).toEqual([]);

    sinon.assert.calledOnce(countDocumentsStub);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        duplicate_from: null,
        $or: [
          { field1: { $regex: "", $options: "i" } },
          { field2: { $regex: "", $options: "i" } },
          { field3: { $regex: "", $options: "i" } },
        ],
        requestType: "SONG",
      },
      null,
      {
        skip: 0,
        limit: 5,
        sort: { created_at: -1 },
      }
    );
  });

  it("Should return paginated  search based on values", async () => {
    const user = sinon.stub();
    const request = sinon.stub();

    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("user title avatar name")
        .returns({
          populate: sinon
            .stub()
            .withArgs("duplicated_from html url")
            .returns({
              exec: sinon.stub().resolves([]),
            }),
        }),
    });
    countDocumentsStub.resolves(50);

    const result = await paginatedSearch({
      requestType: "SONG",
      search: "Kendrick Lamar",
      showDuplicates: true,
      user,
      request,
      pageSize: 10,
      pageNumber: 2,
    });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(5);
    expect(result.pagination.totalResults).toBe(50);
    expect(result.results).toEqual([]);

    sinon.assert.calledOnce(countDocumentsStub);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        $or: [
          { field1: { $regex: "Kendrick Lamar", $options: "i" } },
          { field2: { $regex: "Kendrick Lamar", $options: "i" } },
          { field3: { $regex: "Kendrick Lamar", $options: "i" } },
        ],
        request,
        user,
        requestType: "SONG",
      },
      null,
      {
        skip: 10,
        limit: 10,
        sort: { created_at: -1 },
      }
    );
  });
});

describe("Test like function", () => {
  let creditServiceStub;
  let notificationServiceStub;

  beforeEach(() => {
    creditServiceStub = sinon.stub(creditService, "addCredit");
    notificationServiceStub = sinon.stub(
      notificationService,
      "createNotification"
    );
  });
  afterEach(() => {
    creditServiceStub.restore();
    notificationServiceStub.restore();
  });

  it("Should thrown a already like forbidden error", async () => {
    const recommendaton = {
      isLikedBy: sinon.stub().withArgs("_userId").returns(true),
    };

    await expect(like(recommendaton, { _id: "userId" })).rejects.toThrow(
      "User has already liked this recommendation"
    );
  });

  it("Should thrown an own recommendation forbidden error", async () => {
    const recommendation = {
      isLikedBy: sinon.stub().returns(false),
      user: {
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
    };

    await expect(
      like(recommendation, { _id: "65df6cc757b41fec4d7c3055" })
    ).rejects.toThrow("User cannot like his own recommendation");
  });

  it("Should add a like with random author", async () => {
    const recommendation = {
      _id: "123",
      user: {
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      likes: [],
      isLikedBy: sinon.stub().returns(false),
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis(),
    };

    creditServiceStub.resolves();
    notificationServiceStub.resolves();

    await like(recommendation, { _id: "userId" });

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

    expect(recommendation.likes.length).toEqual(1);
    expect(recommendation.likes[0]).toEqual("userId");
    // expect(result.save).toHaveBeenCalled();
  });

  it("Should add a like with request author", async () => {
    const recommendation = {
      _id: "123",
      user: {
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      likes: ["64dc8e5b6f16b11238c6f9a0"],
      isLikedBy: sinon.stub().returns(false),
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis(),
    };

    creditServiceStub.resolves();
    notificationServiceStub.resolves();

    await like(recommendation, {
      _id: "64dc8e5b6f16b11238c6f9a0",
    });

    sinon.assert.calledOnce(creditServiceStub);
    sinon.assert.calledWith(creditServiceStub, 5, {
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    sinon.assert.calledOnce(notificationServiceStub);

    expect(recommendation.likes.length).toEqual(2);
    expect(recommendation.likes[1]).toEqual("64dc8e5b6f16b11238c6f9a0");
  });
});

describe("Test unlike function", () => {
  let removeCreditStub;

  beforeEach(() => {
    removeCreditStub = sinon.stub(creditService, "removeCredit");
  });
  afterEach(() => {
    removeCreditStub.restore();
  });

  it("Should throw an error on not liked recommendation", async () => {
    const recommendation = {
      _id: "123",
      isLikedBy: sinon.stub().returns(false),
    };

    await expect(unlike(recommendation, { _id: "userId" })).rejects.toThrow(
      `User userId has not liked recommendation 123`
    );
  });

  it("Should unlike a recommendation by a random user", async () => {
    const recommendation = {
      _id: "123",
      isLikedBy: sinon.stub().returns(true),
      likes: [new ObjectId("62dc8e5b6f16b11238c6f9a0")],
      user: {
        balance: 50,
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      populate: sinon.stub().withArgs("user").resolvesThis(),
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      save: sinon.stub().resolvesThis(),
    };

    await unlike(recommendation, { _id: "62dc8e5b6f16b11238c6f9a0" });

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 1, {
      balance: 50,
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });
    expect(recommendation.likes.length).toEqual(0);
  });

  it("Should unlike a recommendation by the request author", async () => {
    const recommendation = {
      _id: "123",
      isLikedBy: sinon.stub().returns(true),
      likes: [new ObjectId("64dc8e5b6f16b11238c6f9a0")],
      user: {
        balance: 50,
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      populate: sinon.stub().withArgs("user").resolvesThis(),
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      save: sinon.stub().resolvesThis(),
    };

    const result = await unlike(recommendation, {
      _id: "64dc8e5b6f16b11238c6f9a0",
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 5, {
      balance: 50,
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    expect(recommendation.likes.length).toEqual(0);
  });

  it("Should unlike a recommendation by the request author but with balance < 5 ", async () => {
    const recommendation = {
      _id: "123",
      isLikedBy: sinon.stub().returns(true),
      likes: [new ObjectId("64dc8e5b6f16b11238c6f9a0")],
      user: {
        balance: 3,
        _id: new ObjectId("65df6cc757b41fec4d7c3055"),
      },
      populate: sinon.stub().withArgs("user").resolvesThis(),
      request: {
        _id: "requestId",
        author: {
          _id: new ObjectId("64dc8e5b6f16b11238c6f9a0"),
        },
      },
      save: sinon.stub().resolvesThis(),
    };

    const result = await unlike(recommendation, {
      _id: "64dc8e5b6f16b11238c6f9a0",
    });

    expect(result).toBeDefined();

    sinon.assert.calledOnce(removeCreditStub);
    sinon.assert.calledWith(removeCreditStub, 3, {
      balance: 3,
      _id: new ObjectId("65df6cc757b41fec4d7c3055"),
    });

    expect(recommendation.likes.length).toEqual(0);
  });
});
