require("dotenv").config();

const config = {
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  GCLOUD_STORAGE_BUCKET: process.env.GCLOUD_STORAGE_BUCKET,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

module.exports = config;
