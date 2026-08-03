const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true
        },

        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        offeredPrice: {
            type: Number,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "completed",
                "cancelled"
            ],
            default: "pending"
        },

        logisticsStatus: {
            type: String,
            enum: ["not_started", "pickup_scheduled", "in_transit", "delivered"],
            default: "not_started"
        }
    },
    { timestamps: true }
);

orderSchema.pre("save", function (next) {
    if (!this.orderId) {
        this.orderId = `GB${Date.now()}`;
    }
    next();
});

module.exports = mongoose.model("Order", orderSchema);