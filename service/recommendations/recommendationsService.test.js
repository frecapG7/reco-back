const Recommendation = require("../../model/Recommendation");
const { searchRecommendations } = require("./recommendationsService");
const { NotFoundError } = require("../../errors/error");
const sinon = require("sinon");

describe("Validate searchRecommendations", () => {
  let findStub;

  beforeEach(() => {
    findStub = sinon.stub(Recommendation, "find");
  });
  afterEach(() => {
    findStub.restore();
  });

  it("Should test happy path", async () => {
    findStub.returns({
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
    });

    const results = await searchRecommendations({
      requestType: "requestType",
      search: "search",
    });

    expect(results.length).toEqual(1);
    expect(results[0].id).toEqual("123");
    expect(results[0].field1).toEqual("field1");
    expect(results[0].field2).toEqual("field2");
    expect(results[0].field3).toEqual("field3");
    expect(results[0].html).toEqual("html");
  });
});
