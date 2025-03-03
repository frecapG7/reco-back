const { generateRandom, generateJWT, verifyJWT, sanitize } = require("./utils");

describe("Test generateRandom function", () => {
  it("Should test different random size values", async () => {
    const random1 = generateRandom(4);
    const random42 = generateRandom(4);

    console.debug(random1);
    console.debug(random42);

    const random2 = generateRandom(6);

    console.debug(random2);

    const random3 = generateRandom(12);

    console.debug(random3);
  });
});

describe("Test generateJWT function", () => {
  it("Should generate a token", async () => {
    const token = generateJWT("ezaze354");

    console.debug(token);

    const result = verifyJWT(token);

    expect(result).toEqual("ezaze354");
  });
});

describe("Test sanitize function", () => {
  it("Should sanitize some html", async () => {
    expect(sanitize("<script>alert('Hello')</script>")).toEqual("");
    expect(sanitize("<b>Hello</b>")).toEqual("<b>Hello</b>");
    expect(sanitize("<a href='http://www.google.com'>Google</a>")).toEqual(
      '<a href="http://www.google.com">Google</a>'
    );
    expect(
      sanitize("<iframe src='http://www.youtube.com'>Youtube</iframe>")
    ).toEqual("Youtube");
  });
});
