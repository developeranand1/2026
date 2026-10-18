const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const staffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Staff name is required"],
            trim: true
        },
        mobile: {
            type: String,
            required: [true, "Mobile number is required"],
            unique: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false
        },
        role: {
            type: String,
            enum: [
                "superadmin",
                "admin",
                "hr",
                "accountant",
                "ceo",
                "cto",
                "field_officer",
                "investor"
            ],
            default: "field_officer"
        },
        designation: {
            type: String,
            default: "Field Officer",
            trim: true
        },
        department: {
            type: String,
            enum: ["Operations", "Human Resources", "Finance", "Technology", "Executive", "Field Sourcing"],
            default: "Operations"
        },
        salary: {
            type: Number,
            default: 0
        },
        assignedArea: {
            district: { type: String, default: "" },
            state: { type: String, default: "" },
            centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center", default: null }
        },
        status: {
            type: String,
            enum: ["active", "suspended", "inactive"],
            default: "active"
        },
        emergencyContact: {
            type: String,
            default: ""
        },
        dailyExpenseLimit: {
            type: Number,
            default: 2000 // Default daily claim limit in INR
        }
    },
    { timestamps: true }
);

staffSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

staffSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Staff", staffSchema);
