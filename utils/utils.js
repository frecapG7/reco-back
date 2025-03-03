"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const sanitizeHtml = require("sanitize-html");

const generateRandom = (size) => {
  return crypto.randomBytes(size).toString("hex");
};

const generateJWT = (value) => {
  return jwt.sign(value, config.TOKEN_SECRET, {
    algorithm: "HS256",
  });
};
const verifyJWT = (token) => {
  return jwt.verify(token, config.TOKEN_SECRET);
};

const sanitize = (html) => {
  return sanitizeHtml(html, {
    allowedTags: ["b", "i", "em", "strong", "a"],
    allowedAttributes: {
      a: ["href"],
    },
    allowedIframeHostnames: ["www.youtube.com"],
  });
};

module.exports = {
  generateRandom,
  generateJWT,
  verifyJWT,
  sanitize,
};
