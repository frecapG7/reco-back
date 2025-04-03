const { InternalServerError } = require("../../errors/error");

const search = async (search, lang = "en") => {
  const params = new URLSearchParams({
    q: encodeURIComponent(search).replace(/%20/g, "+"),
    lang,
    limit: 10,
    fields: "key,title,author_name, cover_i",
  });

  const response = await fetch(
    `https://openlibrary.org/search.json?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Raukaukau (raukaukau@gmail.com)",
      },
    }
  );

  if (!response.ok)
    throw new InternalServerError("Error fetching data", {
      status: response.status,
      statusText: response.statusText,
    });

  const json = await response.json();

  return json.docs.map((doc) => ({
    title: doc.title,
    author: doc.author_name?.join(", "),
    html: `//openlibrary.org${doc.key}/${doc.title
      ?.split(" ")
      .join("_")}/widget`,
    url: `https://openlibrary.org${doc.key}`,
    thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,

    provider: {
      name: "Open Library",
      icon: "/providers/openlibrary.svg",
      url: "https://openlibrary.org",
    },
  }));
};

module.exports = {
  search,
};
