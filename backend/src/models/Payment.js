const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        farmerName: String,
        farmerMobile: String,

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: false
        },

        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop"
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        purpose: {
            type: String,
            enum: ["crop_listing_fee", "order_payment", "subscription"],
            default: "crop_listing_fee"
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
            default: "Razorpay"
        },

        status: {
            type: String,
            enum: ["processing", "received", "failed", "completed"],
            default: "processing"
        },

        transactionId: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String
    },
    { timestamps: true }
);

paymentSchema.pre("save", function () {
    if (this.purpose === "crop_listing_fee") {
        this.commissionAmount = 0;
        this.farmerSettlementAmount = 0;
    } else {
        this.commissionAmount = (this.amount * (this.commissionPercent || 0)) / 100;
        this.farmerSettlementAmount = this.amount - this.commissionAmount;
    }
});

module.exports = mongoose.model("Payment", paymentSchema);