const mongoose = require("mongoose");

const centerSellerSchema = new mongoose.Schema(
    {
        center: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Center",
            required: [true, "Center reference is required"]
        },
        tokenNumber: {
            type: String,
            required: true,
            trim: true
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        farmerName: {
            type: String,
            required: [true, "Farmer / Seller name is required"],
            trim: true
        },
        farmerMobile: {
            type: String,
            required: [true, "Farmer mobile number is required"],
            trim: true
        },
        village: {
            type: String,
            trim: true,
            default: ""
        },
        cropName: {
            type: String,
            required: [true, "Crop / Commodity name is required"],
            trim: true
        },
        variety: {
            type: String,
            trim: true,
            default: "Standard / Grade A"
        },
        quantity: {
            type: Number,
            required: [true, "Quantity / Weight is required"],
            min: [0.01, "Quantity must be greater than 0"]
        },
        unit: {
            type: String,
            default: "Quintal",
            trim: true
        },
        pricePerQuintal: {
            type: Number,
            required: [true, "Rate / Price per quintal is required"],
            min: [0, "Price cannot be negative"]
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentDetails: {
            paymentMode: {
                type: String,
                enum: ["Cash", "UPI", "Bank Transfer", "Cheque"],
                default: "Cash"
            },
            paymentStatus: {
                type: String,
                enum: ["Paid", "Pending", "Partial"],
                default: "Paid"
            },
            paidAmount: {
                type: Number,
                default: 0
            },
            dueAmount: {
                type: Number,
                default: 0
            },
            transactionId: {
                type: String,
                trim: true,
                default: ""
            },
            bankName: {
                type: String,
                trim: true,
                default: ""
            },
            accountNumber: {
                type: String,
                trim: true,
                default: ""
            },
            ifscCode: {
                type: String,
                trim: true,
                default: ""
            }
        },
        status: {
            type: String,
            enum: ["Token Issued", "Weighed & Verified", "Payment Completed", "Cancelled"],
            default: "Payment Completed"
        },
        weighedBy: {
            type: String,
            trim: true,
            default: ""
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        entryDate: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Indexes for searching
centerSellerSchema.index({ center: 1, tokenNumber: 1 });
centerSellerSchema.index({ farmerMobile: 1 });
centerSellerSchema.index({ entryDate: -1 });

module.exports = mongoose.model("CenterSeller", centerSellerSchema);
