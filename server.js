const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const routes = require("./routes/routes");
const mongoose = require("./db");
const handleError = require("./middleware/errorMiddleware");
const cors = require("cors");
const { TOKEN_SECRET } = require("./config");
const logger = require("./logger");

const passport = require("./auth");
const session = require("express-session");

app.use(cors());
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

mongoose.connection.on("open", () => {
  app.listen(process.env.PORT, "0.0.0.0", () => {
    logger.info("Server started successfully");
  });
});
