const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        commissionPercent: {
            type: Number,
            default: 1
        },

        commissionAmount: {
            type: Number,
            default: 0
        },

        farmerSettlementAmount: {
            type: Number,
            default: 0
        },

        paymentMode: {
            type: String,
            enum: ["UPI", "Bank Transfer", "Cash"],
            default: "Bank Transfer"
        },

        status: {
            type: String,
            enum: ["processing", "received", "failed"],
            default: "processing"
        },

        transactionId: String
    },
    { timestamps: true }
);

paymentSchema.pre("save", function (next) {
    this.commissionAmount = (this.amount * this.commissionPercent) / 100;
    this.farmerSettlementAmount = this.amount - this.commissionAmount;
    next();
});

module.exports = mongoose.model("Payment", paymentSchema);