const { iframely } = require("../../config");
const { InternalServerError } = require("../../errors/error");
const logger = require("../../logger");

const getProviderIcon = (icons = []) => {
  return icons
    ?.filter((icon) => icon?.type === "image/png")
    .reduce((a, b) => Math.min(a?.media?.width, b?.media?.width))?.href;
};

const getEmbed = async (url) => {
  if (!Boolean(url))
    throw new InternalServerError("URL argument cannot be empty");

  logger.info(`Fetching iframely embed for ${url}`);
  const params = new URLSearchParams({
    url,
    api_key: iframely.api_key,
    omit_script: true,
    iframe: "card",
    card: "small",
    autoplay: false,
    theme: "light",
  });
  const response = await fetch(`${iframely.url}?${params}`, {
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

const rules = {
  song: {
    accepted: ["soundcloud", "deezer", "spotify"],
    enum: "SONG",
  },
  movie: {
    accepted: ["youtube", "vimeo", "dailymotion"],
    enum: "MOVIE",
  },
  book: {
    accepted: ["goodreads"],
    enum: "BOOK",
  },
};


const getEnum = (url) => {
  const rule = Object.entries(rules).find(([key, value]) =>
    value.accepted.some((accepted) => url.includes(accepted))
  );

  return rule?.[1].enum;
}

module.exports = {
  getEmbed,
};
