const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Farmer Profile Endpoints
router.get("/profile/:id", userController.getUserById);
router.put("/profile/:id", userController.updateUserProfile);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserProfile);

module.exports = router;
