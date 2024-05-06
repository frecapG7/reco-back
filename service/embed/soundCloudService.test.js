const { getOEmbed } = require("./soundcloudService");

describe("Should return oEmbed from soundcloud", () => {
  it("Should return oEmbed from soundcloud", async () => {
    const url =
      "https://soundcloud.com/alfaromero/you-killed-the-sun-1?si=dd64f4ea0ec140f29633cac11746d64a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing";
    const oEmbed = await getOEmbed(url);
    expect(oEmbed).toBeDefined();
    expect(oEmbed).toHaveProperty("url");
    expect(oEmbed).toHaveProperty("title");
    expect(oEmbed).toHaveProperty("description");
    expect(oEmbed).toHaveProperty("thumbnail_url");
  });
});
