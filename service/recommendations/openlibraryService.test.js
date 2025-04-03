const { search } = require("./openlibraryService");

describe("Should validate search", () => {
  it.skip("Should search a french book", async () => {
    const result = await search("Les guerriers du silence", "fr");

    expect(result).toBeDefined();
    console.log(JSON.stringify(result, null, 2));
  });
});
