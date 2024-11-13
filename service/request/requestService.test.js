const Request = require("../../model/Request");
const sinon = require("sinon");
const requestService = require("./requestService");
const { NotFoundError } = require("../../errors/error");
const Recommendation = require("../../model/Recommendation");

const recommendationsStub = sinon.stub(Recommendation, "countDocuments");

describe("Test getRequest", () => {
  let requestStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "findById");
  });
  afterEach(() => {
    requestStub.restore();
    recommendationsStub.reset();
  });

  it("Should thrown a not found error", async () => {
    requestStub.returns({
      populate: sinon
        .stub()
        .withArgs("author")
        .returns({
          exec: sinon.stub().returns(null),
        }),
    });
    await expect(requestService.getRequest("123")).rejects.toThrow(
      NotFoundError
    );
  });

  it("Should return a request", async () => {
    const expected = {
      toJSON: sinon.stub().returnsThis(),
    };
    requestStub.withArgs("123").returns({
      populate: sinon
        .stub()
        .withArgs("author")
        .returns({
          exec: sinon.stub().returns(expected),
        }),
    });

    recommendationsStub.returns(7);

    const result = await requestService.getRequest("123");

    expect(result).toBeDefined();
    expect(result.recommendationsCount).toEqual(7);
  });
});

describe("Test createRequest", () => {
  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(Request.prototype, "save");
  });
  afterEach(() => {
    requestStub.restore();
    recommendationsStub.reset();
  });

  it("Should return a request", async () => {
    requestStub.resolvesThis();

    const result = await requestService.createRequest(
      {
        requestType: "requestType",
        title: "title",
        description: "description",
        tags: ["tag1", "tag2"],
      },
      {
        _id: "613a9b6b9b0b1d1b1c9b1b1b",
      }
    );

    recommendationsStub.returns(0);

    expect(result).toBeDefined();
    expect(result.requestType).toBe("requestType");
    expect(result.title).toBe("title");
    expect(result.description).toBe("description");
    expect(result.tags).toEqual(["tag1", "tag2"]);

    // expect(result.author._id).toEqual('613a9b6b9b0b1d1b1c9b1b1b');

    sinon.assert.calledOnce(requestStub);
  });
});

describe("Test updateRequest", () => {
  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(Request, "findOneAndUpdate");
  });
  afterEach(() => {
    requestStub.restore();
    recommendationsStub.reset();
  });

  it("Should thrown a NotFoundError", async () => {
    requestStub.returns(null);

    await expect(
      requestService.updateRequest("123", {}, { _id: "123" })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return updated request", async () => {
    const expected = {
      toJSON: sinon.stub().returnsThis(),
    };
    requestStub.returns(expected);

    const result = await requestService.updateRequest(
      "123",
      {
        requestType: "BOOK",
        title: "Title",
        description: "description",
        tags: ["tag1", "tag2"],
      },
      {
        _id: "123",
      }
    );
    recommendationsStub.returns(8);

    expect(result).toEqual(expected);
    sinon.assert.calledWith(
      requestStub,
      {
        _id: "123",
        author: "123",
      },
      {
        requestType: "BOOK",
        title: "Title",
        description: "description",
        tags: ["tag1", "tag2"],
      },
      { new: true }
    );

    expect(result.recommendationsCount).toEqual(8);
  });
});

describe("Test deleteRequest", () => {
  let requestStub;

  beforeEach(() => {
    requestStub = sinon.stub(Request, "findOneAndDelete");
  });

  afterEach(() => {
    requestStub.restore();
  });

  it("Should thrown a NotFoundError", async () => {
    requestStub.returns(null);

    await expect(
      requestService.deleteRequest("123", { _id: "123" })
    ).rejects.toThrow(NotFoundError);
  });

  it("Should return deleted request", async () => {
    const expected = new Request();
    requestStub.returns(expected);

    const result = await requestService.deleteRequest("123", { _id: "123" });

    expect(result).toEqual(expected);
    sinon.assert.calledWith(requestStub, {
      _id: "123",
      author: "123",
    });
  });
});
