const mongoose = require("mongoose");

const levyRateSchema = new mongoose.Schema(
    {
        // Location Hierarchy
        state: {
            type: String,
            default: "Uttar Pradesh"
        },
        city: {
            type: String
        },
        district: {
            type: String,
            default: "Sant Kabir Nagar"
        },
        municipality: {
            type: String
        },
        zone: {
            type: String
        },
        mandiName: {
            type: String,
            default: "Khalilabad APMC Mandi"
        },

        // Commodity & Property Details
        commodity: {
            type: String
        },
        hindiName: {
            type: String
        },
        cropName: {
            type: String
        },
        variety: {
            type: String,
            default: "Grade A"
        },
        category: {
            type: String,
            default: "Grains"
        },
        propertyType: {
            type: String,
            default: "Agricultural APMC Mandi"
        },
        propertySubType: {
            type: String,
            default: "Wholesale Trade"
        },

        // Pricing & Benchmark Rates
        pricePerQuintal: {
            type: Number
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
        rate: {
            type: Number,
            required: true
        },
        rateUnit: {
            type: String,
            default: "Quintal"
        },
        unit: {
            type: String,
            default: "Quintal"
        },

        // Mandi Levy / Cess Details
        levyRate: {
            type: Number,
            default: 1.5
        },
        levyUnit: {
            type: String,
            default: "%"
        },
        calculationMethod: {
            type: String,
            default: "Percentage on Modal Trade Value"
        },
        assessmentYear: {
            type: String,
            default: "2026-2027"
        },

        // Effective Dates & Status
        effectiveFrom: {
            type: Date,
            default: Date.now
        },
        effectiveTo: {
            type: Date
        },
        rateDate: {
            type: Date,
            default: Date.now
        },
        arrivalDate: {
            type: String
        },
        change: {
            type: String,
            default: "+0"
        },
        isUp: {
            type: Boolean,
            default: true
        },
        trend: {
            type: String,
            enum: ["up", "down", "same"],
            default: "same"
        },
        status: {
            type: String,
            enum: ["active", "inactive", "pending"],
            default: "active"
        },
        source: {
            type: String,
            default: "Official Mandi APMC Administration"
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("LevyRate", levyRateSchema);
