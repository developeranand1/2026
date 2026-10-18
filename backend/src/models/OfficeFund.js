const mongoose = require("mongoose");

const officeFundSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title/Purpose of transaction is required"],
            trim: true
        },
        type: {
            type: String,
            enum: [
                "INVESTMENT_IN",      // Money received from Investor / Founder / Capital
                "OFFICE_EXPENSE",     // Office rent, electricity, stationary, software
                "FIELD_DISBURSEMENT", // Fund given in advance or reimbursed to field team
                "SALARY_PAYOUT",      // Staff salary
                "REVENUE_IN",         // Revenue earned by company / platform fees
                "OTHER_OUT"           // Miscellaneous outflow
            ],
            required: true
        },
        direction: {
            type: String,
            enum: ["INFLOW", "OUTFLOW"],
            required: true
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [1, "Amount must be at least 1"]
        },
        // In case of INVESTMENT_IN / Investor Fund
        investorDetails: {
            name: { type: String, default: "" },
            organization: { type: String, default: "" },
            mobile: { type: String, default: "" },
            email: { type: String, default: "" },
            equityPercentage: { type: Number, default: 0 }
        },
        // In case of FIELD_DISBURSEMENT / expense reimbursement
        recipientStaff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null
        },
        paymentMode: {
            type: String,
            enum: ["UPI", "BANK_TRANSFER", "CASH", "CHEQUE", "NEFT_RTGS"],
            default: "BANK_TRANSFER"
        },
        transactionReference: {
            type: String,
            default: "",
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            default: ""
        },
        receiptUrl: {
            type: String,
            default: ""
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("OfficeFund", officeFundSchema);
