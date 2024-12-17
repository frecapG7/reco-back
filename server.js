const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const routes = require("./routes/routes");
const mongoose = require("./db");
const pino = require("pino-http");
const handleError = require("./middleware/errorMiddleware");
const cors = require("cors");
require("dotenv");

const { TOKEN_SECRET } = require("./config");

const passport = require("./auth");
const session = require("express-session");

app.use(cors());
// app.use(pino());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", routes);
app.use(handleError);

// Passport will manage authentication
app.use(
  session({ secret: TOKEN_SECRET, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI, {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});
mongoose.connection.once("open", () => {
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log("Example app listening on port 3000!");
  });
});
