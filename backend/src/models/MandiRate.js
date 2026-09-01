const mongoose = require("mongoose");

const mandiRateSchema = new mongoose.Schema(
    {
        // Legacy / Common fields
        cropName: {
            type: String,
            required: true
        },
        mandiName: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        pricePerQuintal: {
            type: Number,
            required: true
        },
        changeAmount: {
            type: Number,
            default: 0
        },
        trend: {
            type: String,
            enum: ["up", "down", "same"],
            default: "same"
        },
        rateDate: {
            type: Date,
            default: Date.now
        },

        // Detailed Government APMC Fields
        state: {
            type: String
        },
        district: {
            type: String
        },
        commodity: {
            type: String
        },
        hindiName: {
            type: String
        },
        variety: {
            type: String
        },
        category: {
            type: String
        },
        minPrice: {
            type: Number
        },
        maxPrice: {
            type: Number
        },
        modalPrice: {
            type: Number
        },
        unit: {
            type: String,
            default: "Quintal"
        },
        change: {
            type: String
        },
        isUp: {
            type: Boolean,
            default: true
        },
        source: {
            type: String,
            default: "Official AGMARKNET / Govt of India"
        },
        arrivalDate: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MandiRate", mandiRateSchema);