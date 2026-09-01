const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weather.controller");

// GET /api/weather
router.get("/", weatherController.getLiveWeather);

module.exports = router;
