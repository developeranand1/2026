const mongoose = require("mongoose");

const mandiRateSchema = new mongoose.Schema(
    {
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
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MandiRate", mandiRateSchema);