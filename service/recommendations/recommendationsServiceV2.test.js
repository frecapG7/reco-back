const sinon = require("sinon");
const Recommendation = require("../../model/Recommendation");
const { create } = require("./recommendationsServiceV2");

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
