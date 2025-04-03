const search = async (search = "", limit = 10) => {
  params = new URLSearchParams({
    q: search,
  });

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Cannot search deezer", { ...response });
  const json = await response.json();

  return json.items?.map((book) => ({
    title: book.volumeInfo.title,
    author: book.volumeInfo.authors?.join(", "),
    additional: book.volumeInfo.publishedDate,
    thumbnail: `https://books.google.com/books?id=${book.id}&printsec=frontcover&img=1&zoom=2&edge=curl&source=gbs_api`,
    url: book.volumeInfo.infoLink,
    html: `https://books.google.com/books?id=${book.id}&pg=PA1&output=embed`,
    provider: {
      name: "Google Books",
      icon: "/providers/googleBooks.svg",
      url: "https://books.google.com",
    },
  }));
};

module.exports = {
  search,
};
