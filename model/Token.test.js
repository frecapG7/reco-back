const Token = require("./Token");

describe("Token method.toJSON", () => {
  it("should return a JSON object", () => {
    const token = new Token({
      _id: "64f6db09096d83b20116e62f",
      value: "125zefz",
    });

    const result = token.toJSON();

    expect(result.id).toBeDefined();
    expect(result.value).toEqual("125zefz");
    expect(result.created).toBeDefined();
  });
});
