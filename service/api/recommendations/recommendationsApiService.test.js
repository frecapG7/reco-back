const sinon = require("sinon");
const Recommendation = require("../../../model/Recommendation");
const recommendationsService = require("../../recommendations/recommendationsServiceV2");
const creditService = require("../../market/creditService");

const { get, create } = require("./recommendationsApiService");

describe("Should validate get", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Recommendation, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw NotFoundError", async () => {
    findByIdStub.resolves(null);

    await expect(get({ params: { id: "123" } })).rejects.toThrowError(
      "Recommendation not found"
    );
  });

  it("Should return recommendation", async () => {
    const expected = sinon.mock(Recommendation);

    findByIdStub.resolves(expected);

    const result = await get({ params: { id: "123" } });

    expect(result).toEqual(expected);
  });
});

describe("Should test create recommendation", () => {
  let addCreditStub;
  let createStub;

  beforeEach(() => {
    addCreditStub = sinon.stub(creditService, "addCredit");
    createStub = sinon.stub(recommendationsService, "create");
  });

  afterEach(() => {
    addCreditStub.restore();
    createStub.restore();
  });

  it("Should throw error on unauthenticated", async () => {
    await expect(
      create({
        body: {},
      })
    ).rejects.toThrow(
      "You need to be authenticated to create a recommendation"
    );
  });

  it("Should create recommendation", async () => {
    const expected = {
      save: sinon.stub().resolvesThis(),
    };

    createStub.resolves(expected);
    addCreditStub.resolvesThis();

    const result = await create({
      body: {
        field1: "field1",
        field2: "field2",
        field3: "field3",
        html: "html",
        url: "https://www.youtube.com",
        requestType: "SONG",
        provider: "provider",
      },
      user: { _id: "userId" },
    });

    expect(result).toBeDefined();
    expect(result).toEqual(expected);

    sinon.assert.calledOnce(addCreditStub);
    sinon.assert.calledWith(addCreditStub, 1, { _id: "userId" });
    
  });
});
