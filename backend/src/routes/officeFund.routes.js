const express = require("express");
const router = express.Router();
const officeFundController = require("../controllers/officeFund.controller");
const { protectStaff, authorizeRoles } = require("../middlewares/staff.middleware");

// Overview available to Admin, HR, Accountant, CEO, Investor
router.get(
    "/overview",
    protectStaff,
    authorizeRoles("superadmin", "admin", "hr", "accountant", "ceo", "investor"),
    officeFundController.getFundOverview
);

// All transactions
router.get(
    "/transactions",
    protectStaff,
    authorizeRoles("superadmin", "admin", "hr", "accountant", "ceo", "investor"),
    officeFundController.getAllTransactions
);

// Record transaction (Admin, Accountant, CEO)
router.post(
    "/transactions",
    protectStaff,
    authorizeRoles("superadmin", "admin", "accountant", "ceo"),
    officeFundController.recordTransaction
);

// Seed sample data for testing
router.post(
    "/seed",
    officeFundController.seedInitialFunds
);

module.exports = router;
