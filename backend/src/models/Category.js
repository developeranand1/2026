const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
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
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80"
        },
        icon: {
            type: String,
            default: "bi-tag-fill"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        displayOrder: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Pre-save hook to generate slug
categorySchema.pre("save", function () {
    if (this.isModified("name") || !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }
});

module.exports = mongoose.model("Category", categorySchema);
