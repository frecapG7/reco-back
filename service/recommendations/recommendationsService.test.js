const Recommendation = require("../../model/Recommendation");
const { searchRecommendations } = require("./recommendationsService");
const { NotFoundError } = require("../../errors/error");
const sinon = require("sinon");
const { search } = require("../request/requestService");

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
                  exec: sinon.stub().returns([
                    {
                      _id: "123",
                      field1: "field1",
                      field2: "field2",
                      field3: "field3",
                      html: "html",
                    },
                  ]),
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
                  exec: sinon.stub().returns([
                    {
                      _id: "123",
                      field1: "field1",
                      field2: "field2",
                      field3: "field3",
                      html: "html",
                    },
                  ]),
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
