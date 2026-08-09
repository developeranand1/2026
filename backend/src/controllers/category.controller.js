const mongoose = require("mongoose");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const cloudinary = require("../config/cloudinary");

/**
 * Cloudinary Image Upload Handler
 * POST /api/categories/upload-image
 */
exports.uploadCloudinaryImage = async (req, res) => {
    try {
        const { imageStr } = req.body;

        if (!imageStr) {
            return res.status(400).json({ success: false, message: "Image data is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(imageStr, {
            folder: "gaonbazar_categories",
            transformation: [{ width: 800, height: 600, crop: "limit" }]
        });

        res.json({
            success: true,
            message: "Image uploaded to Cloudinary successfully!",
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Cloudinary upload error: " + error.message
        });
    }
};

/**
 * Get all categories with subcategories directly from MongoDB (No dummy seeding)
 * GET /api/categories
 */
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });

        const categoryList = await Promise.all(
            categories.map(async (cat) => {
                const subcategories = await Subcategory.find({ category: cat._id }).sort({ createdAt: -1 });
                return {
                    ...cat.toObject(),
                    subcategories
                };
            })
        );

        res.json({
            success: true,
            count: categoryList.length,
            data: categoryList
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear All Categories from Database
 * DELETE /api/categories/clear-all
 */
exports.clearAllCategories = async (req, res, next) => {
    try {
        await Category.deleteMany({});
        await Subcategory.deleteMany({});

        res.json({
            success: true,
            message: "All categories and subcategories cleared from database successfully!"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Category in Database
 * POST /api/categories
 */
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, image, icon, isActive, displayOrder } = req.body;
        
        const category = await Category.create({
            name,
            description,
            image: image || undefined,
            icon: icon || "bi-tag-fill",
            isActive: isActive !== undefined ? isActive : true,
            displayOrder: displayOrder || 0
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Category in Database
 * PUT /api/categories/:id
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID" });
        }

        const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Category and subcategories in Database
 * DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID" });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Delete associated subcategories
        await Subcategory.deleteMany({ category: id });

        res.json({
            success: true,
            message: "Category and subcategories deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Subcategory in Database
 * POST /api/categories/subcategory
 */
exports.createSubcategory = async (req, res, next) => {
    try {
        const { name, categoryId, description, image, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID for subcategory" });
        }

        const subcategory = await Subcategory.create({
            name,
            category: categoryId,
            description,
            image: image || undefined,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: subcategory
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Subcategory in Database
 * PUT /api/categories/subcategory/:id
 */
exports.updateSubcategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Subcategory ID" });
        }

        const subcategory = await Subcategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!subcategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        res.json({
            success: true,
            message: "Subcategory updated successfully",
            data: subcategory
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Subcategory in Database
 * DELETE /api/categories/subcategory/:id
 */
exports.deleteSubcategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Subcategory ID" });
        }

        const subcategory = await Subcategory.findByIdAndDelete(id);
        if (!subcategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        res.json({
            success: true,
            message: "Subcategory deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
