const sinon = require("sinon");
const Recommendation = require("../../model/Recommendation");
const { create, paginatedSearch } = require("./recommendationsServiceV2");

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
    findStub.resolves([]);
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

    findStub.resolves([]);
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
