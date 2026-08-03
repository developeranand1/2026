const mongoose = require("mongoose");

const buyerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        companyName: {
            type: String,
            trim: true
        },
        gstNumber: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: String,
            district: String,
            state: String,
            pincode: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("BuyerProfile", buyerProfileSchema);
