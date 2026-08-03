const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        cropName: {
            type: String,
            required: true,
            enum: [
                "Wheat",
                "Mustard",
                "Paddy",
                "Maize",
                "Pulses",
                "Vegetables",
                "Fruits"
            ]
        },

        grade: {
            type: String,
            default: "Grade A"
        },

        quantity: {
            type: Number,
            required: true
        },

        unit: {
            type: String,
            enum: ["Qtl", "Kg", "Ton"],
            default: "Qtl"
        },

        expectedPrice: {
            type: Number,
            required: true
        },

        priceUnit: {
            type: String,
            default: "Quintal"
        },

        location: {
            type: String,
            required: true
        },

        photo: {
            url: String,
            publicId: String
        },

        status: {
            type: String,
            enum: ["active", "sold", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);