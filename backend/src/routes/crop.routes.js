const express = require("express");
const router = express.Router();

const {
    getAllCrops,
    getMyCrops,
    getCropById,
    addCrop,
    updateCropApproval,
    updateCrop,
    deleteCrop
} = require("../controllers/crop.controller");

// Public / Authenticated endpoints
router.get("/", getAllCrops);
router.get("/my-crops", getMyCrops);
router.get("/:id", getCropById);

// Add, Update, Approval, Delete Endpoints
router.post("/", addCrop);
router.patch("/:id/approval", updateCropApproval);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);

module.exports = router;