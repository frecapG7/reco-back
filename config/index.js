require("dotenv").config();

const config = {
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  GCLOUD_STORAGE_BUCKET: process.env.GCLOUD_STORAGE_BUCKET,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  db: {
    uri: process.env.MONGODB_URI,
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },

  server: process.env.SERVER_URL || "http://localhost:3000",
};

module.exports = config;
