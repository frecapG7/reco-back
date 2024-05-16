const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const routes = require("./routes/routes");
const mongoose = require("./db");
const pino = require("pino-http");
const handleError = require("./middleware/errorMiddleware");
const cors = require("cors");

const { TOKEN_SECRET } = require("./config");

const passport = require("./auth");
const session = require("express-session");

app.use(cors());
app.use(pino());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", routes);
app.use(handleError);

// Passport will manage authentication
//app.use(session({ secret: TOKEN_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB...");
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log("Example app listening on port 3000!");
  });
});
