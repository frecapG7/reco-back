const mongoose = require("mongoose");
const config = require("./config");

// mongoose.set("transactionAsyncLocalStorage", true);
mongoose.set("debug", true);

const buildMongoUri = () => {
  const { uri, user, password } = config.db;
  return uri.replace("<username>", user).replace("<password>", password);
};

mongoose.connect(buildMongoUri(), {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});

module.exports = mongoose;
