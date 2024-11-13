const { get } = require("lodash");
const { InternalServerError } = require("../../errors/error");

const getProviderIcon = (icons = []) => {
  return icons
    ?.filter((icon) => icon?.type === "image/png")
    .reduce((a, b) => Math.min(a?.media?.width, b?.media?.width))?.href;
};

const getEmbed = async (url) => {
  if (!Boolean(url))
    throw new InternalServerError("URL argument cannot be empty");

  const params = new URLSearchParams({
    url,
    api_key: "c66db96b69614d7618a6e8",
    omit_script: true,
    iframe: "card",
    card: "small",
    autoplay: false,
    theme: "light",
  });
  const response = await fetch(`https://iframe.ly/api/iframely?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new InternalServerError("Error fetching embed");

  const json = await response.json();

  return {
    title: json.meta?.title,
    author: json.meta?.author,
    description: json.meta?.description,
    medium: json.meta.medium,
    provider: {
      name: json.meta.site,
      icon: getProviderIcon(json.links.icon),
    },
    html: json.html,
    url: json.meta.canonical,
  };
};

module.exports = {
  getEmbed,
};
