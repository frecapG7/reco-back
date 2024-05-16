const { InternalServerError } = require("../../errors/error");

const getEmbed = async (url) => {
  if (!Boolean(url))
    throw new InternalServerError("URL argument cannot be empty");

  const params = new URLSearchParams({
    url,
    api_key: "c66db96b69614d7618a6e8",
    omit_script: true,
  });
  const response = await fetch(`https://iframe.ly/api/oembed?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new InternalServerError("Error fetching embed");

  return await response.json();
};

module.exports = {
  getEmbed,
};
