const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Subcategory name is required"],
            trim: true
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Parent Category is required"]
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80"
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

subcategorySchema.pre("save", function () {
    if (this.isModified("name") || !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }
});

module.exports = mongoose.model("Subcategory", subcategorySchema);
