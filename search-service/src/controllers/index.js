const express = require("express");
const searchService = require("../services/searchService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(searchService.getServiceInfo());
});

module.exports = router;
