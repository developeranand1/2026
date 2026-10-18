const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
    {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        accuracy: { type: Number, default: 0 },
        address: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now }
    },
    { _id: false }
);

const fieldWorkSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: true
        },
        date: {
            type: String, // YYYY-MM-DD for easy day queries
            required: true
        },
        startTime: {
            type: Date,
            default: Date.now
        },
        endTime: {
            type: Date,
            default: null
        },
        startLocation: {
            type: locationSchema,
            required: true
        },
        endLocation: {
            type: locationSchema,
            default: null
        },
        status: {
            type: String,
            enum: ["IN_PROGRESS", "COMPLETED", "AUTO_CLOSED"],
            default: "IN_PROGRESS"
        },
        startCaption: {
            type: String,
            default: "Started field duty",
            trim: true
        },
        endCaption: {
            type: String,
            default: "",
            trim: true
        },
        summaryReport: {
            type: String,
            default: ""
        },
        farmersVisitedCount: {
            type: Number,
            default: 0
        },
        distanceCoveredKm: {
            type: Number,
            default: 0
        },
        photos: [
            {
                url: { type: String },
                caption: { type: String, default: "" },
                uploadedAt: { type: Date, default: Date.now }
            }
        ],
        verifiedByHr: {
            type: Boolean,
            default: false
        },
        hrRemarks: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FieldWork", fieldWorkSchema);
