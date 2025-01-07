const mongoose = require("mongoose");
const config = require("./config");

mongoose.set("transactionAsyncLocalStorage", true);
// mongoose.set("debug", true);

const buildMongoUri = () => {
  const { uri, user, password } = config.db;
  return uri.replace("<username>", user).replace("<password>", password);
};

connect = async () => {
  try {
    await mongoose.connect(buildMongoUri(), {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error(err);
  }
};

mongoose.connection.on("error", (err) => {
  console.error(err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = mongoose;
