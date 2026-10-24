const express = require("express");
const userService = require("../services/userService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(userService.getServiceInfo());
});

module.exports = router;
