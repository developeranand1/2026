const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: true
        },
        fieldWork: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FieldWork",
            default: null
        },
        category: {
            type: String,
            enum: [
                "TRAVEL_FUEL",
                "FOOD_DA",
                "LODGING",
                "FARMER_MEETING",
                "MOBILE_INTERNET",
                "STATIONERY",
                "MISCELLANEOUS"
            ],
            default: "TRAVEL_FUEL"
        },
        amount: {
            type: Number,
            required: [true, "Expense amount is required"],
            min: [1, "Amount must be greater than 0"]
        },
        billDate: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String,
            required: [true, "Description/purpose of expense is required"],
            trim: true
        },
        billPhotoUrl: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED_BY_HR",
                "REJECTED",
                "APPROVED_BY_ADMIN",
                "PAID_REIMBURSED"
            ],
            default: "PENDING"
        },
        hrReviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null
        },
        hrRemarks: {
            type: String,
            default: ""
        },
        adminReviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null
        },
        adminRemarks: {
            type: String,
            default: ""
        },
        paidAt: {
            type: Date,
            default: null
        },
        paymentReference: {
            type: String,
            default: ""
        },
        deductedFromFundId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OfficeFund",
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
