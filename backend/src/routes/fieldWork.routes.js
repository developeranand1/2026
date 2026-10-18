const express = require("express");
const router = express.Router();
const fieldWorkController = require("../controllers/fieldWork.controller");
const { protectStaff, authorizeRoles } = require("../middlewares/staff.middleware");

// Employee operations (Mobile app & Field portal)
router.post("/start", protectStaff, fieldWorkController.startWork);
router.post("/end", protectStaff, fieldWorkController.endWork);
router.get("/active", protectStaff, fieldWorkController.getActiveSession);
router.get("/my-history", protectStaff, fieldWorkController.getMyFieldHistory);

// Admin & HR operations
router.get(
    "/all",
    protectStaff,
    authorizeRoles("superadmin", "admin", "hr", "ceo", "accountant"),
    fieldWorkController.getAllFieldWork
);

router.patch(
    "/:id/verify",
    protectStaff,
    authorizeRoles("superadmin", "admin", "hr"),
    fieldWorkController.verifyFieldWork
);

module.exports = router;
