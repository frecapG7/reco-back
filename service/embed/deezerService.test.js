const { search } = require("./deezerService");

describe("Should validate search from deezer", () => {
  it.skip("Should return search from deezer", async () => {
    const result = await search("gauche droite", 10);
    expect(result).toBeDefined();

    console.log(JSON.stringify(result, null, 2));
  });
});
