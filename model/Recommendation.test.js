const Recommendation = require("./Recommendation");
const ObjectId = require("mongoose").Types.ObjectId;
describe("Recommendation method.toJSON", () => {
  it("should return a JSON object", () => {
    const recommendation = new Recommendation({
      _id: "64f6db09096d83b20116e62f",
      request: "64f6db09096d83b20116e62f",
      user: {
        _id: "64f6db09096d83b20116e62f",
        name: "test",
      },
      field1: "field1",
      field2: "field2",
      field3: "field3",
      html: "<p>html</p>",
      url: "url",
      created_at: new Date(),
    });

    const recommendationJSON = recommendation.toJSON();

    expect(recommendationJSON.id).toBeDefined();
    // expect(recommendationJSON.user.id).toEqual('64f6db09096d83b20116e62f');
    // expect(recommendationJSON.request).toEqual('64f6db09096d83b20116e62f');
    expect(recommendationJSON.field1).toEqual("field1");
    expect(recommendationJSON.field2).toEqual("field2");
    expect(recommendationJSON.field3).toEqual("field3");
    expect(recommendationJSON.created_at).toBeDefined();

    expect(recommendationJSON.user).toBeDefined();
    expect(recommendationJSON.user.id).toBeDefined();
    // expect(recommendationJSON.user.name).toEqual("name");

    expect(recommendationJSON.html).toEqual("<p>html</p>");
    expect(recommendationJSON.url).toEqual("url");
  });
});

describe("Should validate isLikedBy method", () => {
  it("Should return false because userId is null or undefined", async () => {
    const recommendation = new Recommendation({
      _id: "64f6db09096d83b20116e62f",
      request: "64f6db09096d83b20116e62f",
      user: {
        _id: "64f6db09096d83b20116e62f",
        name: "test",
      },
    });

    expect(recommendation.isLikedBy(null)).toBe(false);
    expect(recommendation.isLikedBy(undefined)).toBe(false);
  });

  it("Should return false because userId is not in likes array", async () => {
    const recommendation = new Recommendation({
      _id: "64f6db09096d83b20116e62f",
      request: "64f6db09096d83b20116e62f",
      user: {
        _id: "64f6db09096d83b20116e62f",
        name: "test",
      },
      likes: [new ObjectId("64f6db09096d83b20116e62f")],
    });

    expect(recommendation.isLikedBy("64f6db09096d83b20145fdf")).toBe(false);
  });

  it("Should return true because userId is in likes array", async () => {
    const recommendation = new Recommendation({
      _id: "64f6db09096d83b20116e62f",
      request: "64f6db09096d83b20116e62f",
      user: {
        _id: "64f6db09096d83b20116e62f",
        name: "test",
      },
    });
    recommendation.likes.push(new ObjectId("64f6db09096d83b20116e62f"));

    console.log(recommendation.likes.length);
    console.log(recommendation.likes);
    console.log(recommendation.likes[0]);
    expect(recommendation.isLikedBy("64f6db09096d83b20116e62f")).toBe(true);
  });
});
