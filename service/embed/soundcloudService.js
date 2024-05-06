const getOEmbed = async (url) => {
  if (!url) throw new Error("URL is required");

  const params = new URLSearchParams({
    url,
    format: "json",
    maxwidth: 500,
    maxheight: 200,
  });
  const response = await fetch(`https://soundcloud.com/oembed?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Invalid URL", { ...response });

  return await response.json();
};

module.exports = {
  getOEmbed,
};
