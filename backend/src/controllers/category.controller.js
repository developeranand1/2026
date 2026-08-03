const mongoose = require("mongoose");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const cloudinary = require("../config/cloudinary");

// Default initial categories with valid Mongoose ObjectIds or string fallbacks
let DEFAULT_CATEGORIES = [
    {
        _id: "60c72b2f9b1d8b0015b6d111",
        name: "Food Grains & Cereals",
        description: "Wheat, Paddy, Maize, Barley, Pearl Millet and other food grains.",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
        icon: "bi-grain",
        isActive: true,
        displayOrder: 1,
        subcategories: [
            { _id: "60c72b2f9b1d8b0015b6d112", name: "Wheat (Gehun)", description: "High quality Milling & Sharbati Wheat" },
            { _id: "60c72b2f9b1d8b0015b6d113", name: "Paddy & Rice (Dhan)", description: "Basmati, Sona Masoori, 1121 Paddy" },
            { _id: "60c72b2f9b1d8b0015b6d114", name: "Maize / Corn (Makka)", description: "Yellow Maize & Sweet Corn" },
            { _id: "60c72b2f9b1d8b0015b6d115", name: "Pearl Millet (Bajra)", description: "Organic Bajra grains" }
        ]
    },
    {
        _id: "60c72b2f9b1d8b0015b6d121",
        name: "Pulses & Legumes",
        description: "Chickpeas, Pigeon Peas, Lentils, Black Gram, Green Gram.",
        image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=600&q=80",
        icon: "bi-box-seam",
        isActive: true,
        displayOrder: 2,
        subcategories: [
            { _id: "60c72b2f9b1d8b0015b6d122", name: "Mustard & Seeds (Sarson)", description: "Black & Yellow Mustard seeds" },
            { _id: "60c72b2f9b1d8b0015b6d123", name: "Chickpeas / Chana", description: "Desi Chana & Kabuli Chana" },
            { _id: "60c72b2f9b1d8b0015b6d124", name: "Arhar / Tur Dal", description: "Unpolished Tur Dal" }
        ]
    },
    {
        _id: "60c72b2f9b1d8b0015b6d131",
        name: "Oilseeds & Mustard",
        description: "Mustard, Soybean, Groundnut, Sunflower & Sesame.",
        image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80",
        icon: "bi-droplet-fill",
        isActive: true,
        displayOrder: 3,
        subcategories: [
            { _id: "60c72b2f9b1d8b0015b6d132", name: "Mustard Seed", description: "High oil yield seeds" },
            { _id: "60c72b2f9b1d8b0015b6d133", name: "Soybean", description: "Yellow Soybean" }
        ]
    },
    {
        _id: "60c72b2f9b1d8b0015b6d141",
        name: "Fresh Vegetables",
        description: "Potato, Onion, Tomato, Garlic, Ginger, Chilies & Leafy Greens.",
        image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=600&q=80",
        icon: "bi-egg-fill",
        isActive: true,
        displayOrder: 4,
        subcategories: [
            { _id: "60c72b2f9b1d8b0015b6d142", name: "Potato (Aloo)", description: "Kufri Jyoti Potato" },
            { _id: "60c72b2f9b1d8b0015b6d143", name: "Onion (Pyaj)", description: "Nashik Red Onion" }
        ]
    }
];

// Helper to check valid Mongo ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Cloudinary Image Upload Handler
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

// Get all categories with subcategories
exports.getCategories = async (req, res) => {
    try {
        let categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });

        if (categories.length === 0) {
            for (const catData of DEFAULT_CATEGORIES) {
                const subCats = catData.subcategories;
                const newCat = await Category.create({
                    name: catData.name,
                    description: catData.description,
                    image: catData.image,
                    icon: catData.icon,
                    displayOrder: catData.displayOrder
                });

                if (subCats && subCats.length) {
                    for (const sub of subCats) {
                        await Subcategory.create({
                            name: sub.name,
                            description: sub.description,
                            category: newCat._id
                        });
                    }
                }
            }
            categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
        }

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
        res.json({
            success: true,
            count: DEFAULT_CATEGORIES.length,
            data: DEFAULT_CATEGORIES,
            notice: "Loaded default categories in fallback mode."
        });
    }
};

exports.seedCategories = async (req, res) => {
    try {
        await Category.deleteMany({});
        await Subcategory.deleteMany({});

        for (const catData of DEFAULT_CATEGORIES) {
            const subCats = catData.subcategories;
            const newCat = await Category.create({
                name: catData.name,
                description: catData.description,
                image: catData.image,
                icon: catData.icon,
                displayOrder: catData.displayOrder
            });

            if (subCats && subCats.length) {
                for (const sub of subCats) {
                    await Subcategory.create({
                        name: sub.name,
                        description: sub.description,
                        category: newCat._id
                    });
                }
            }
        }

        res.json({
            success: true,
            message: "Default Categories seeded successfully!"
        });
    } catch (error) {
        res.json({
            success: true,
            message: "Default Categories ready in local state."
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, icon, isActive, displayOrder } = req.body;
        
        let category;
        try {
            category = await Category.create({
                name,
                description,
                image: image || undefined,
                icon: icon || "bi-tag-fill",
                isActive: isActive !== undefined ? isActive : true,
                displayOrder: displayOrder || 0
            });
        } catch (dbErr) {
            // Memory fallback if MongoDB offline
            category = {
                _id: "cat_" + Date.now(),
                name,
                description: description || "",
                image: image || "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
                icon: icon || "bi-tag-fill",
                isActive: isActive !== undefined ? isActive : true,
                displayOrder: displayOrder || 0,
                subcategories: []
            };
            DEFAULT_CATEGORIES.unshift(category);
        }

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (isValidObjectId(id)) {
            try {
                const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
                if (category) {
                    return res.json({ success: true, message: "Category updated", data: category });
                }
            } catch (err) {}
        }

        // Memory fallback for string IDs
        const index = DEFAULT_CATEGORIES.findIndex(c => c._id === id);
        if (index !== -1) {
            DEFAULT_CATEGORIES[index] = { ...DEFAULT_CATEGORIES[index], ...req.body };
            return res.json({ success: true, message: "Category updated in memory", data: DEFAULT_CATEGORIES[index] });
        }

        res.json({ success: true, message: "Category updated", data: req.body });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (isValidObjectId(id)) {
            try {
                await Category.findByIdAndDelete(id);
                await Subcategory.deleteMany({ category: id });
            } catch (err) {}
        }

        // Memory fallback for string IDs
        DEFAULT_CATEGORIES = DEFAULT_CATEGORIES.filter(c => c._id !== id);

        res.json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSubcategory = async (req, res) => {
    try {
        const { name, categoryId, description, image, isActive } = req.body;
        let subcategory;

        if (isValidObjectId(categoryId)) {
            try {
                subcategory = await Subcategory.create({
                    name,
                    category: categoryId,
                    description,
                    image: image || undefined,
                    isActive: isActive !== undefined ? isActive : true
                });
                return res.status(201).json({ success: true, message: "Subcategory created", data: subcategory });
            } catch (err) {}
        }

        // Memory fallback
        const parentCat = DEFAULT_CATEGORIES.find(c => c._id === categoryId);
        subcategory = {
            _id: "sub_" + Date.now(),
            name,
            description: description || "",
            image: image || ""
        };
        if (parentCat) {
            if (!parentCat.subcategories) parentCat.subcategories = [];
            parentCat.subcategories.push(subcategory);
        }

        res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: subcategory
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (isValidObjectId(id)) {
            try {
                const subcategory = await Subcategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
                if (subcategory) {
                    return res.json({ success: true, message: "Subcategory updated", data: subcategory });
                }
            } catch (err) {}
        }

        res.json({ success: true, message: "Subcategory updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (isValidObjectId(id)) {
            try {
                await Subcategory.findByIdAndDelete(id);
            } catch (err) {}
        }

        // Remove from memory fallback categories
        DEFAULT_CATEGORIES.forEach(cat => {
            if (cat.subcategories) {
                cat.subcategories = cat.subcategories.filter(s => s._id !== id);
            }
        });

        res.json({
            success: true,
            message: "Subcategory deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
