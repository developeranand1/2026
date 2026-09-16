const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Participant name is required"],
        trim: true
    },
    village: {
        type: String,
        trim: true,
        default: ""
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    cropsGrown: {
        type: String,
        trim: true,
        default: ""
    },
    status: {
        type: String,
        enum: ["Registered", "Attended", "Certified"],
        default: "Registered"
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

const trainingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Training title is required"],
            trim: true
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Organic Farming",
                "Crop Protection & Pest Management",
                "Drip Irrigation & Water Tech",
                "Dairy & Animal Husbandry",
                "Govt Schemes & Subsidies",
                "Mandi Trading & Digital Literacy",
                "Soil Health & Fertilizer",
                "Horticulture & Fruits",
                "General Training"
            ],
            default: "Organic Farming"
        },
        trainerName: {
            type: String,
            required: [true, "Trainer or expert name is required"],
            trim: true
        },
        trainerDesignation: {
            type: String,
            trim: true,
            default: "Krishi Vigyan Expert"
        },
        organizer: {
            type: String,
            trim: true,
            default: "KrisiMarg Kisan Training Mission"
        },
        village: {
            type: String,
            required: [true, "Village / Gaon is required"],
            trim: true
        },
        district: {
            type: String,
            required: [true, "District is required"],
            trim: true
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
            default: "Uttar Pradesh"
        },
        fullAddress: {
            type: String,
            required: [true, "Full address / venue is required"],
            trim: true
        },
        startDate: {
            type: Date,
            required: [true, "Training start date is required"]
        },
        endDate: {
            type: Date
        },
        time: {
            type: String,
            required: [true, "Time is required (e.g. 10:00 AM - 02:00 PM)"],
            trim: true,
            default: "10:00 AM - 02:00 PM"
        },
        duration: {
            type: String,
            trim: true,
            default: "1 Day (4 Hours)"
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        topics: {
            type: [String],
            default: []
        },
        coverImage: {
            type: String,
            default: ""
        },
        galleryImages: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
            default: "Upcoming"
        },
        maxCapacity: {
            type: Number,
            default: 50
        },
        registeredCount: {
            type: Number,
            default: 0
        },
        fee: {
            type: String,
            default: "Free / निःशुल्क"
        },
        contactPerson: {
            type: String,
            trim: true,
            default: "KrisiMarg Training Desk"
        },
        contactPhone: {
            type: String,
            trim: true,
            default: "9125955106"
        },
        successSummary: {
            type: String,
            trim: true,
            default: ""
        },
        keyAchievements: {
            type: [String],
            default: []
        },
        participants: [participantSchema],
        isFeatured: {
            type: Boolean,
            default: false
        },
        views: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Pre-save hook to generate slug
trainingSchema.pre("save", function () {
    if (this.isModified("title") || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
            .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);
    }

    if (this.participants) {
        this.registeredCount = this.participants.length;
    }
});

module.exports = mongoose.model("Training", trainingSchema);
