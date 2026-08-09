const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Contacted", "Resolved", "Closed"],
            default: "Pending"
        },
        adminRemark: {
            type: String,
            trim: true,
            default: ""
        },
        contactedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
