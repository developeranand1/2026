const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },

        role: {
            type: String,
            enum: ["farmer", "buyer", "admin"],
            default: "farmer"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active"
        },

        hasPaidListingFee: {
            type: Boolean,
            default: false
        },

        listingFeePaymentId: {
            type: String,
            default: ""
        },

        listingFeePaidAt: {
            type: Date
        },

        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null
        },

        registrationSource: {
            type: String,
            enum: ["web", "field_app", "admin", "direct"],
            default: "web"
        },

        registeredAtLocation: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
            address: { type: String, default: "" }
        }
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);