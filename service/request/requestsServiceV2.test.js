const Request = require("../../model/Request");
const { paginatedSearch } = require("./requestsServiceV2");
const sinon = require("sinon");

describe("Should validate paginatedSerch", () => {
  let coundDocumentsStub;
  let findStub;

  beforeEach(() => {
    coundDocumentsStub = sinon.stub(Request, "countDocuments");
    findStub = sinon.stub(Request, "find");
  });

  afterEach(() => {
    coundDocumentsStub.restore();
    findStub.restore();
  });

  it("Should return paginated results based on default values", async () => {
    coundDocumentsStub.resolves(10);
    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("author", "avatar name title")
        .returns({
          exec: sinon.stub().resolves([{ _id: "1234" }, { _id: "5678" }]),
        }),
    });

    const result = await paginatedSearch({});

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(2);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.totalResults).toBe(10);

    sinon.assert.calledOnce(coundDocumentsStub);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        $or: [
          { title: { $regex: "", $options: "i" } },
          { description: { $regex: "", $options: "i" } },
          { tags: { $in: [""] } },
        ],
      },
      null,
      {
        skip: 0,
        limit: 5,
        sort: { created_at: -1 },
      }
    );
  });

  it("Should return paginated results based on custom values", async () => {
    coundDocumentsStub.resolves(10);

    findStub.returns({
      populate: sinon
        .stub()
        .withArgs("author", "avatar name title")
        .returns({
          exec: sinon.stub().resolves([{ _id: "1234" }, { _id: "5678" }]),
        }),
    });

    const result = await paginatedSearch({
      requestType: "BOOK",
      user: { _id: "1234" },
      search: "search",
      pageSize: 50,
      pageNumber: 2,
      sort: { modified_at: 1 },
    });

    expect(result).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(2);
    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(10);

    sinon.assert.calledOnce(coundDocumentsStub);
    sinon.assert.calledOnce(findStub);
    sinon.assert.calledWith(
      findStub,
      {
        $or: [
          { title: { $regex: "search", $options: "i" } },
          { description: { $regex: "search", $options: "i" } },
          { tags: { $in: ["search"] } },
        ],
        requestType: "BOOK",
        author: { _id: "1234" },
      },
      null,
      {
        skip: 50,
        limit: 50,
        sort: { modified_at: 1 },
      }
    );
  });
});
