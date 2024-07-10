const router = require("express").Router({ mergeParams: true });

router.use("", require("./requests"));
router.use("/:requestId/recommendations", require("./recommendations"));

module.exports = router;
