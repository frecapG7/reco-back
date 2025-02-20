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

module.exports = {
  defaultSettings,
  acceptedUrls,
};
