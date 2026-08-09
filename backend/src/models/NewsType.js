const mongoose = require("mongoose");

const newsTypeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "News type title is required"],
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Pre-save hook to generate slug from title
newsTypeSchema.pre("save", function () {
    if (this.isModified("title") || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});

module.exports = mongoose.model("NewsType", newsTypeSchema);
