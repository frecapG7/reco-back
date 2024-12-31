const mongoose = require("mongoose");

mongoose.set("transactionAsyncLocalStorage", true);
// mongoose.set("debug", true);

connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
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
