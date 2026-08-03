const mongoose = require("mongoose");

const farmerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        location: {
            village: String,
            city: String,
            district: String,
            state: String,
            pincode: String
        },

        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String
        },

        totalCropsListed: {
            type: Number,
            default: 0
        },

        totalEarnings: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FarmerProfile", farmerProfileSchema);