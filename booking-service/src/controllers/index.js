const express = require("express");
const bookingService = require("../services/bookingService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(bookingService.getServiceInfo());
});

module.exports = router;
