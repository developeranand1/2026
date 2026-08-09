const Crop = require("../models/Crop");
const FarmerProfile = require("../models/FarmerProfile");
const BuyerProfile = require("../models/BuyerProfile");

/**
 * Get All Crop Listings & Buyer Purchasing Demands
 * GET /api/crops
 */
exports.getAllCrops = async (req, res, next) => {
    try {
        const { role, type, status, category, approvalStatus, search } = req.query;

        let query = {};

        if (role && role !== "all") {
            query.postedByRole = role;
        }

        if (type && type !== "all") {
            query.type = type;
        }

        if (status && status !== "all") {
            query.status = status;
        } else if (!status) {
            query.status = "active";
        }

        if (approvalStatus && approvalStatus !== "all") {
            query.approvalStatus = approvalStatus;
        }

        if (category && category !== "all") {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { cropName: { $regex: search, $options: "i" } },
                { subcategory: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { postedByName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const crops = await Crop.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: crops.length,
            data: crops
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Crop by ID
 * GET /api/crops/:id
 */
exports.getCropById = async (req, res, next) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop listing not found"
            });
        }

        res.json({
            success: true,
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Current Logged-in User's Crops
 * GET /api/crops/my-crops
 */
exports.getMyCrops = async (req, res, next) => {
    try {
        const crops = await Crop.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: crops.length,
            data: crops
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Crop Listing / Buyer Purchasing Demand (Admin, Farmer, Buyer)
 * POST /api/crops
 */
exports.addCrop = async (req, res, next) => {
    try {
        let {
            cropName,
            category,
            subcategory,
            variety,
            grade,
            quantity,
            unit,
            originalPrice,
            expectedPrice,
            discountPercentage,
            priceUnit,
            location,
            description,
            image,
            images,
            type,
            postedByRole,
            postedByName,
            postedByMobile,
            status,
            approvalStatus
        } = req.body;

        const userId = req.user ? req.user._id : undefined;
        const userRole = req.user ? req.user.role : (postedByRole || "admin");
        const userName = req.user ? req.user.name : (postedByName || "GaonBazar Admin");
        const userMobile = req.user ? req.user.mobile : (postedByMobile || "");

        const imageList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
        const primaryImage = imageList.length > 0 ? imageList[0] : (image || "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80");

        const targetApproval = approvalStatus || (userRole === "admin" ? "approved" : "approved");
        const isAppr = targetApproval === "approved";

        let origPrice = Number(originalPrice) || 0;
        let salePrice = Number(expectedPrice) || 0;
        let discPercent = Number(discountPercentage) || 0;

        if (origPrice > 0 && salePrice > 0 && origPrice > salePrice) {
            discPercent = Math.round(((origPrice - salePrice) / origPrice) * 100);
        } else if (origPrice > 0 && discPercent > 0) {
            salePrice = Math.round(origPrice * (1 - discPercent / 100));
        } else if (salePrice > 0 && origPrice === 0) {
            origPrice = salePrice;
        }

        const crop = await Crop.create({
            postedBy: userId,
            postedByRole: userRole,
            postedByName: userName,
            postedByMobile: userMobile,
            type: type || "sell",
            cropName,
            category: category || "Food Grains & Cereals",
            subcategory: subcategory || "",
            variety: variety || "",
            grade: grade || "Grade A",
            quantity: quantity || 1,
            unit: unit || "Qtl",
            originalPrice: origPrice,
            expectedPrice: salePrice,
            discountPercentage: discPercent,
            priceUnit: priceUnit || "Quintal",
            location,
            description: description || "",
            image: primaryImage,
            images: imageList,
            status: status || "active",
            isApproved: isAppr,
            approvalStatus: targetApproval
        });

        // Increment count in farmer profile if applicable
        if (userId && userRole === "farmer") {
            await FarmerProfile.findOneAndUpdate({ user: userId }, { $inc: { totalCropsListed: 1 } });
        }

        res.status(201).json({
            success: true,
            message: "Crop listing created successfully",
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle Crop Approval Status (Admin Endpoint)
 * PATCH /api/crops/:id/approval
 */
exports.updateCropApproval = async (req, res, next) => {
    try {
        const { approvalStatus } = req.body; // 'approved' | 'pending' | 'rejected'
        const isApproved = approvalStatus === "approved";

        const crop = await Crop.findByIdAndUpdate(
            req.params.id,
            { approvalStatus, isApproved },
            { new: true, runValidators: true }
        );

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop listing not found"
            });
        }

        res.json({
            success: true,
            message: `Crop approval status updated to '${approvalStatus}'`,
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Crop Listing
 * PUT /api/crops/:id
 */
exports.updateCrop = async (req, res, next) => {
    try {
        const updateData = { ...req.body };

        if (Array.isArray(updateData.images) && updateData.images.length > 0) {
            updateData.image = updateData.images[0];
        }

        if (updateData.approvalStatus) {
            updateData.isApproved = updateData.approvalStatus === "approved";
        }

        let origPrice = Number(updateData.originalPrice) || 0;
        let salePrice = Number(updateData.expectedPrice) || 0;
        let discPercent = Number(updateData.discountPercentage) || 0;

        if (origPrice > 0 && salePrice > 0 && origPrice > salePrice) {
            discPercent = Math.round(((origPrice - salePrice) / origPrice) * 100);
        } else if (origPrice > 0 && discPercent > 0) {
            salePrice = Math.round(origPrice * (1 - discPercent / 100));
        }

        updateData.originalPrice = origPrice;
        updateData.expectedPrice = salePrice;
        updateData.discountPercentage = discPercent;

        const crop = await Crop.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop listing not found"
            });
        }

        res.json({
            success: true,
            message: "Crop updated successfully",
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Crop Listing
 * DELETE /api/crops/:id
 */
exports.deleteCrop = async (req, res, next) => {
    try {
        const crop = await Crop.findByIdAndDelete(req.params.id);

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop listing not found"
            });
        }

        res.json({
            success: true,
            message: "Crop deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};