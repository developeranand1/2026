const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");
const { protectStaff, authorizeRoles } = require("../middlewares/staff.middleware");

// Employee operations (Submit & Track)
router.post("/submit", protectStaff, expenseController.submitExpense);
router.get("/my-expenses", protectStaff, expenseController.getMyExpenses);

// Admin / HR / Accountant view all expenses
router.get(
    "/all",
    protectStaff,
    authorizeRoles("superadmin", "admin", "hr", "accountant", "ceo"),
    expenseController.getAllExpenses
);

// HR review (Approve / Reject)
router.patch(
    "/:id/hr-review",
    protectStaff,
    authorizeRoles("superadmin", "admin", "hr"),
    expenseController.reviewExpenseByHr
);

// Admin / Accountant reimburse & disburse funds
router.post(
    "/:id/reimburse",
    protectStaff,
    authorizeRoles("superadmin", "admin", "accountant", "ceo"),
    expenseController.reimburseExpense
);

module.exports = router;
