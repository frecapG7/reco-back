const { defaults } = require("sanitize-html");

/**
 * User default settings
 */
const defaultSettings = {
  lang: "en",
  theme: "light",
  notifications: true,
  privacy: {
    privateRequests: false,
    privateRecommendations: false,
    privateFollows: false,
    privatePurchases: true,
  },
};

const acceptedUrls = [
  "soundcloud",
  "deezer",
  "spotify",
  "youtube",
  "vimeo",
  "dailymotion",
  "twitch",
  "mixcloud",
  "bandcamp",
  "audiomack",
  "wikipedia",
];

const providers = {
  BOOK: [
    {
      name: "OPENLIBRARY",
      icon: "/providers/openlibrary.svg",
      uri: "https://www.openlibrary.org/",
      default: true,
    },
    {
      name: "GOOGLEBOOKS",
      icon: "/providers/googleBooks.svg",
      uri: "https://books.google.com/",
    },
  ],
  SONG: [
    {
      name: "DEEZER",
      icon: "https://cdn-icons-png.flaticon.com/512/5968/5968860.png",
      uri: "https://www.deezer.com/",
      default: true,
    },
    {
      name: "SOUNDCLOUD",
      icon: "https://cdn-icons-png.flaticon.com/512/49/49336.png",
      uri: "https://www.soundcloud.com/",
    },
  ],
};

module.exports = {
  defaultSettings,
  acceptedUrls,
  providers,
};
