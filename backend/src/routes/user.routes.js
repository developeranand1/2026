const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/status", userController.updateUserStatus);
router.patch("/:id/verification", userController.updateUserVerification);
router.delete("/:id", userController.deleteUser);

module.exports = router;
