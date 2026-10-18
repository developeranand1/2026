const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const { protectStaff, authorizeRoles } = require("../middlewares/staff.middleware");

// Public staff auth endpoints
router.post("/login", staffController.staffLogin);
router.post("/seed", staffController.seedStaffMembers);

// Authenticated staff endpoints
router.get("/profile", protectStaff, staffController.getStaffProfile);

// Admin & HR management endpoints
router.get("/", protectStaff, authorizeRoles("superadmin", "admin", "hr", "ceo"), staffController.getAllStaff);
router.post("/", protectStaff, authorizeRoles("superadmin", "admin", "hr", "ceo"), staffController.createStaff);
router.put("/:id", protectStaff, authorizeRoles("superadmin", "admin", "hr", "ceo"), staffController.updateStaff);
router.patch("/:id/toggle-status", protectStaff, authorizeRoles("superadmin", "admin", "hr", "ceo"), staffController.toggleStaffStatus);

module.exports = router;
