const express = require("express");
const router = express.Router();

const {
    createLevyRate,
    getAllLevyRates,
    getLevyRateById,
    updateLevyRate,
    deleteLevyRate,
    updateLevyRateStatus
} = require("../controllers/levyRate.controller");

// CRUD & Status Endpoints
router.post("/", createLevyRate);
router.get("/", getAllLevyRates);
router.get("/:id", getLevyRateById);
router.put("/:id", updateLevyRate);
router.delete("/:id", deleteLevyRate);
router.patch("/:id/status", updateLevyRateStatus);

module.exports = router;
