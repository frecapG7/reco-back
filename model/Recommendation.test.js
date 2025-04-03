const Recommendation = require("./Recommendation");
const ObjectId = require("mongoose").Types.ObjectId;
describe("Recommendation method.toJSON", () => {
  it("should return a JSON object with deprecated fields", () => {
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
    expect(recommendationJSON.title).toEqual("field1");
    expect(recommendationJSON.author).toEqual("field2");
    expect(recommendationJSON.created_at).toBeDefined();

    expect(recommendationJSON.user).toBeDefined();
    expect(recommendationJSON.user.id).toBeDefined();

    expect(recommendationJSON.html).toEqual("<p>html</p>");
    expect(recommendationJSON.url).toEqual("url");
  });
  it("should return a JSON object with new fields", () => {
    const recommendation = new Recommendation({
      _id: "64f6db09096d83b20116e62f",
      request: "64f6db09096d83b20116e62f",
      user: {
        _id: "64f6db09096d83b20116e62f",
        name: "test",
      },
      title: "This is title",
      author: "This is author",
      field3: "field3",
      html: "<p>html</p>",
      url: "url",
      created_at: new Date(),
    });

    const recommendationJSON = recommendation.toJSON();

    expect(recommendationJSON.id).toBeDefined();
    expect(recommendationJSON.title).toEqual("This is title");
    expect(recommendationJSON.author).toEqual("This is author");
    expect(recommendationJSON.created_at).toBeDefined();

    expect(recommendationJSON.user).toBeDefined();
    expect(recommendationJSON.user.id).toBeDefined();

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
