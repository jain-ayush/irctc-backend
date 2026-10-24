const express = require("express");
const paymentService = require("../services/paymentService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(paymentService.getServiceInfo());
});

module.exports = router;
