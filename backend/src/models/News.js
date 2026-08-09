const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "News title is required"],
            trim: true
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true
        },
        shortDescription: {
            type: String,
            trim: true,
            default: ""
        },
        description: {
            type: String,
            required: [true, "News content/description is required"],
            trim: true
        },
        newsType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NewsType",
            required: [true, "News type category is required"]
        },
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80"
        },
        status: {
            type: String,
            enum: ["Draft", "Published", "Archived"],
            default: "Published"
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        author: {
            type: String,
            trim: true,
            default: "GaonBazar News Desk"
        },

        // SEO Meta Data Fields
        metaTitle: {
            type: String,
            trim: true,
            default: ""
        },
        metaDescription: {
            type: String,
            trim: true,
            default: ""
        },
        metaKeywords: {
            type: String,
            trim: true,
            default: ""
        },

        views: {
            type: Number,
            default: 0
        },
        publishedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Pre-save hook to auto generate slug from title
newsSchema.pre("save", function () {
    if (this.isModified("title") || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});

module.exports = mongoose.model("News", newsSchema);
