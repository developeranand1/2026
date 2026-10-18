const Expense = require("../models/Expense");
const OfficeFund = require("../models/OfficeFund");
const Staff = require("../models/Staff");

/**
 * Field staff submits a work-related expense claim
 */
exports.submitExpense = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const {
            category,
            amount,
            billDate,
            description,
            billPhotoUrl,
            fieldWorkId
        } = req.body;

        if (!amount || !description) {
            return res.status(400).json({
                success: false,
                message: "Amount and description/purpose of expense are required"
            });
        }

        const expense = await Expense.create({
            staff: staffId,
            fieldWork: fieldWorkId || null,
            category: category || "TRAVEL_FUEL",
            amount: Number(amount),
            billDate: billDate ? new Date(billDate) : new Date(),
            description,
            billPhotoUrl: billPhotoUrl || "",
            status: "PENDING"
        });

        res.status(201).json({
            success: true,
            message: "Expense claim submitted successfully. Sent to HR for review.",
            data: expense
        });
    } catch (error) {
        console.error("Submit Expense Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get personal expenses for logged-in staff
 */
exports.getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ staff: req.staff._id })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Admin / HR / Accountant view: Get all expense claims with filters
 */
exports.getAllExpenses = async (req, res) => {
    try {
        const { status, category, staffId, limit = 100 } = req.query;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (staffId) query.staff = staffId;

        const expenses = await Expense.find(query)
            .populate("staff", "name mobile designation department assignedArea")
            .populate("hrReviewer", "name role")
            .populate("adminReviewer", "name role")
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        // Calculate summary totals
        let totalPending = 0;
        let totalApproved = 0;
        let totalPaid = 0;

        expenses.forEach((e) => {
            if (e.status === "PENDING") totalPending += e.amount;
            else if (e.status === "APPROVED_BY_HR" || e.status === "APPROVED_BY_ADMIN") totalApproved += e.amount;
            else if (e.status === "PAID_REIMBURSED") totalPaid += e.amount;
        });

        res.json({
            success: true,
            count: expenses.length,
            summary: {
                totalPending,
                totalApproved,
                totalPaid
            },
            data: expenses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * HR Review: Approve or Reject an expense claim
 */
exports.reviewExpenseByHr = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks } = req.body; // action: 'APPROVE' or 'REJECT'

        if (!["APPROVE", "REJECT"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Action must be APPROVE or REJECT"
            });
        }

        const expense = await Expense.findById(id).populate("staff", "name mobile");
        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        expense.hrReviewer = req.staff._id;
        expense.hrRemarks = remarks || "";
        expense.status = action === "APPROVE" ? "APPROVED_BY_HR" : "REJECTED";

        await expense.save();

        res.json({
            success: true,
            message: `Expense claim ${action === "APPROVE" ? "Approved by HR" : "Rejected by HR"}`,
            data: expense
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Admin Final Approval & Payout / Reimbursement
 * Automatically deducts from Office Fund
 */
exports.reimburseExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMode, transactionReference, adminRemarks } = req.body;

        const expense = await Expense.findById(id).populate("staff", "name mobile designation");
        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense claim not found" });
        }

        if (expense.status === "PAID_REIMBURSED") {
            return res.status(400).json({
                success: false,
                message: "This expense claim has already been reimbursed and paid."
            });
        }

        // 1. Create Outflow record in OfficeFund
        const fundOutflow = await OfficeFund.create({
            title: `Field Reimbursement: ${expense.category} for ${expense.staff?.name || "Employee"}`,
            type: "FIELD_DISBURSEMENT",
            direction: "OUTFLOW",
            amount: expense.amount,
            recipientStaff: expense.staff?._id,
            paymentMode: paymentMode || "UPI",
            transactionReference: transactionReference || `EXP-REIMB-${Date.now()}`,
            notes: `Expense ID: ${expense._id}. Purpose: ${expense.description}`,
            recordedBy: req.staff._id
        });

        // 2. Mark expense as PAID_REIMBURSED
        expense.status = "PAID_REIMBURSED";
        expense.paidAt = new Date();
        expense.paymentReference = transactionReference || fundOutflow.transactionReference;
        expense.adminReviewer = req.staff._id;
        expense.adminRemarks = adminRemarks || "Approved and disbursed from office fund";
        expense.deductedFromFundId = fundOutflow._id;

        await expense.save();

        res.json({
            success: true,
            message: "Expense reimbursed successfully. Funds deducted from Treasury ledger.",
            data: {
                expense,
                fundTransaction: fundOutflow
            }
        });
    } catch (error) {
        console.error("Reimburse Expense Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
