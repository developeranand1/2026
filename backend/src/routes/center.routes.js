const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
    createCenter,
    getAllCenters,
    getCenterById,
    updateCenter,
    deleteCenter,
    addWorkerToCenter,
    updateWorkerInCenter,
    removeWorkerFromCenter,
    uploadCenterImage,
    addSellerEntry,
    getCenterSellerEntries,
    getSellerEntryById,
    deleteSellerEntry,
    searchFarmers,
    quickRegisterFarmer,
    completeSellerSale
} = require("../controllers/center.controller");

// Optional auth helper to attach user if token exists
const optionalAuth = async (req, res, next) => {
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            const token = req.headers.authorization.split(" ")[1];
            if (token && process.env.JWT_SECRET) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select("-password");
            }
        }
    } catch (err) {
        // Silently continue for optional auth
    }
    next();
};

// Center Image Upload
router.post("/upload-image", optionalAuth, uploadCenterImage);

// Farmer Search & Quick Register for Centers (Must be before /:id)
router.get("/farmers/search", searchFarmers);
router.post("/farmers/quick-register", optionalAuth, quickRegisterFarmer);

// Centers CRUD
router.post("/", optionalAuth, createCenter);
router.get("/", getAllCenters);
router.get("/:id", getCenterById);
router.put("/:id", optionalAuth, updateCenter);
router.delete("/:id", optionalAuth, deleteCenter);

// Worker Management within a Center
router.post("/:id/workers", optionalAuth, addWorkerToCenter);
router.put("/:id/workers/:workerId", optionalAuth, updateWorkerInCenter);
router.delete("/:id/workers/:workerId", optionalAuth, removeWorkerFromCenter);

// Farmer / Seller Management within a Center (4-digit token generation)
router.post("/:id/sellers", optionalAuth, addSellerEntry);
router.get("/:id/sellers", getCenterSellerEntries);
router.get("/sellers/:entryId", getSellerEntryById);
router.put("/sellers/:entryId/complete-sale", optionalAuth, completeSellerSale);
router.delete("/sellers/:entryId", optionalAuth, deleteSellerEntry);

module.exports = router;
