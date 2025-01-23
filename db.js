const mongoose = require("mongoose");
const { db } = require("./config");

mongoose.set("transactionAsyncLocalStorage", true);
mongoose.set("debug", false);

const mongoUri = db.uri
  .replace("<username>", db.user)
  .replace("<password>", db.password);

mongoose.connect(mongoUri, {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});

module.exports = mongoose;
