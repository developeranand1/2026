const express = require("express");
const router = express.Router();

const {
    getLiveMandiRates,
    getTodayMandiRates,
    addMandiRate
} = require("../controllers/mandiRate.controller");

router.get("/live", getLiveMandiRates);
router.get("/", getTodayMandiRates);
router.post("/", addMandiRate);

module.exports = router;