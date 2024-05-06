const getOEmbed = async (url) => {
  if (url.includes("soundcloud.com")) {
    return await soundcloudService.getOEmbed(url);
  }

  return null;
};

const getEmbed = async (url) => {
  const oEmbed = await getOEmbed(url);

  return {
    url: oEmbed.url,
    title: oEmbed.title,
    description: oEmbed.description,
    thumbnail: oEmbed.thumbnail_url,
  };
};

module.exports = {
  getEmbed,
};
