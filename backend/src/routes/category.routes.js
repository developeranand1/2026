const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// Public endpoints
router.get("/", categoryController.getCategories);

// Cloudinary image upload
router.post("/upload-image", categoryController.uploadCloudinaryImage);

// Admin operations
router.delete("/clear-all", categoryController.clearAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

// Subcategories
router.post("/subcategory", categoryController.createSubcategory);
router.put("/subcategory/:id", categoryController.updateSubcategory);
router.delete("/subcategory/:id", categoryController.deleteSubcategory);

module.exports = router;
