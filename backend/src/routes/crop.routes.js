const express = require("express");
const router = express.Router();

const {
    addCrop,
    getMyCrops,
    getCropById,
    updateCrop,
    deleteCrop
} = require("../controllers/crop.controller");

const { protect } = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.use(protect);
router.use(authorizeRoles("farmer"));

router.post("/", addCrop);
router.get("/my-crops", getMyCrops);
router.get("/:id", getCropById);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);

module.exports = router;