const getOEmbed = async (url) => {
  if (!url) throw new Error("URL is required");

  const params = new URLSearchParams({
    url,
    format: "json",
    maxwidth: 500,
    maxheight: 200,
  });
  const response = await fetch(`https://deezer.com/oembed?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Invalid URL", { ...response });

  return await response.json();
};

const search = async (search = "", limit = 10) => {
  params = new URLSearchParams({
    q: search,
  });

  const response = await fetch(
    `https://api.deezer.com/search/track?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Cannot search deezer", { ...response });
  const json = await response.json();

  return (
    json.data?.slice(0, limit).map((track) => ({
      title: track.title,
      author: track.artist.name,
      url: track.link,
      thumbnail: track.album.cover,
      html: `https://widget.deezer.com/widget/auto/track/${track.id}`,
      provider: {
        name: "Deezer",
        icon: "/providers/deezer.png",
        url: "https://www.deezer.com",
      },
    })) || []
  );
};

module.exports = {
  getOEmbed,
  search,
};
