const express = require("express");
const adminProducts = require("./market/adminProducts");

const router = express.Router({ mergeParams: true });

router.use("/users", require("./users/adminUsers"));

router.use("/market/products", adminProducts);

module.exports = router;
