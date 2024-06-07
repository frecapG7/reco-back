const express = require("express");
const router = express.Router();

const { getEmbed } = require("../service/embed/embedService");

router.post("", async (req, res, next) => {
  try {
    const { url } = req.body;
    const embed = await getEmbed(url);
    res.status(200).json(embed);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
