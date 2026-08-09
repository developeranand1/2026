const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        postedByRole: {
            type: String,
            enum: ["farmer", "buyer", "admin"],
            default: "farmer"
        },

        postedByName: {
            type: String,
            default: "GaonBazar Farmer"
        },

        postedByMobile: {
            type: String,
            default: ""
        },

        type: {
            type: String,
            enum: ["sell", "buy"],
            default: "sell"
        },

        cropName: {
            type: String,
            required: [true, "Crop name is required"],
            trim: true
        },

        category: {
            type: String,
            default: "Food Grains & Cereals"
        },

        subcategory: {
            type: String,
            default: ""
        },

        variety: {
            type: String,
            default: ""
        },

        grade: {
            type: String,
            default: "Grade A"
        },

        quantity: {
            type: Number,
            required: true,
            default: 1
        },

        unit: {
            type: String,
            enum: ["Qtl", "Kg", "Ton"],
            default: "Qtl"
        },

        originalPrice: {
            type: Number,
            default: 0
        },

        expectedPrice: {
            type: Number,
            required: true
        },

        discountPercentage: {
            type: Number,
            default: 0
        },

        priceUnit: {
            type: String,
            default: "Quintal"
        },

        location: {
            type: String,
            required: true,
            default: "Uttar Pradesh"
        },

        description: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80"
        },

        images: {
            type: [String],
            default: []
        },

        photo: {
            url: String,
            publicId: String
        },

        status: {
            type: String,
            enum: ["active", "sold", "inactive"],
            default: "active"
        },

        isApproved: {
            type: Boolean,
            default: true
        },

        approvalStatus: {
            type: String,
            enum: ["approved", "pending", "rejected"],
            default: "approved"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);