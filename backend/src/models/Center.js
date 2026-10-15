const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Worker name is required"],
        trim: true
    },
    role: {
        type: String,
        default: "Worker",
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    joiningDate: {
        type: Date,
        default: Date.now
    }
});

const centerSchema = new mongoose.Schema(
    {
        centerName: {
            type: String,
            required: [true, "Center name is required"],
            trim: true
        },
        image: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },
        pinCode: {
            type: String,
            required: [true, "Pin code is required"],
            trim: true
        },
        openingTime: {
            type: String,
            required: [true, "Opening time/Operating hours are required"],
            trim: true,
            default: "09:00 AM - 06:00 PM"
        },
        helplineNumber: {
            type: String,
            required: [true, "Helpline number is required"],
            trim: true
        },
        // Main Director / Head of the center
        director: {
            name: {
                type: String,
                required: [true, "Director/Head name is required"],
                trim: true
            },
            contactNumber: {
                type: String,
                trim: true,
                default: ""
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                default: ""
            },
            designation: {
                type: String,
                default: "Center Director",
                trim: true
            }
        },
        // Helping person / Assistant / Coordinator
        helpingStaff: {
            name: {
                type: String,
                trim: true,
                default: ""
            },
            contactNumber: {
                type: String,
                trim: true,
                default: ""
            },
            role: {
                type: String,
                default: "Assistant / Coordinator",
                trim: true
            }
        },
        // Workers working at the center
        workers: [workerSchema],
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
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

// Indexes for fast search
centerSchema.index({ centerName: "text", address: "text", pinCode: 1 });

module.exports = mongoose.model("Center", centerSchema);
