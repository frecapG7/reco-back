const Request = require("./Request");

describe("Request method.toJSON", () => {
  it("should return a JSON object", () => {
    const request = new Request({
      requestType: "BOOK",
      title: "SciFi recommended book",
      description: "SciFi recommended book",
      tags: ["SciFi", "Book"],
      author: "64f6db09096d83b20116e62f",
    });

    const requestJSON = request.toJSON();

    expect(requestJSON.id).toBeDefined();
    expect(requestJSON.requestType).toEqual("BOOK");
    expect(requestJSON.title).toEqual("SciFi recommended book");
    expect(requestJSON.description).toEqual("SciFi recommended book");
    expect(requestJSON.tags).toEqual(["SciFi", "Book"]);
    expect(requestJSON.created).toBeDefined();
    expect(requestJSON.author.id.equals("64f6db09096d83b20116e62f")).toEqual(
      true
    );
  });
});
