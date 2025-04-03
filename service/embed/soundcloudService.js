const { soundcloud } = require("../../config");
const ExternalAccessToken = require("../../model/tokens/ExternalAccessToken");

const search = async (search, limit = 10) => {
  const externalAccessToken = await getAccessToken();

  const params = new URLSearchParams({
    q: encodeURIComponent(search).replace(/%20/g, "+"),
    limit,
  });

  console.log("params", params.toString());
  const result = await fetch(soundcloud.url + `/tracks?${params}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `OAuth ${externalAccessToken.accessToken}`,
    },
  });

  if (!result.ok) throw new Error("Invalid URL", { ...result });
  const json = await result.json();

  return json.map((track) => ({
    title: track.title,
    author: track.user.username,
    url: track.permalink_url,
    thumbnail: track.artwork_url,
    html: `https://w.soundcloud.com/player/?url=${track.uri}`,
    provider: {
      name: "SoundCloud",
      icon: "/providers/soundcloud.png",
    },
  }));
};

const getAccessToken = async () => {
  // 1 - Fetch from BD
  const externalAccessToken = await ExternalAccessToken.findOne({
    provider: "soundcloud",
  });
  if (!externalAccessToken) return await authenticate();

  // 2 - Check if token is valid
  if (externalAccessToken && Date.now() < externalAccessToken.expiresAt) {
    return externalAccessToken;
  }

  // 3 - Refresh token
  const refreshToken = await refresh(externalAccessToken.refreshToken);

  // 4 - Save new token
  externalAccessToken.accessToken = refreshToken.access_token;
  externalAccessToken.refreshToken = refreshToken.refresh_token;
  externalAccessToken.expiresAt = Date.now() + refreshToken.expires_in * 1000;
  return await externalAccessToken.save();
};

const authenticate = async () => {
  const btoa = Buffer.from(
    `${soundcloud.clientId}:${soundcloud.clientSecret}`
  ).toString("base64");

  console.log(btoa);
  const response = await fetch(soundcloud.auth, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Invalid Authentication", { ...response });
  }
  const json = await response.json();

  const externalAccessToken = new ExternalAccessToken({
    provider: "soundcloud",
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  });

  return await externalAccessToken.save();
};

const refresh = async (refreshToken) => {
  const response = await fetch(soundcloud.auth, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: soundcloud.clientId,
      client_secret: soundcloud.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Error refreshin token", { ...response });
  }
  return await response.json();
};

module.exports = {
  search,
};
