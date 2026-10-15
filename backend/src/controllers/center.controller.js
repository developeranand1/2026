const mongoose = require("mongoose");
const Center = require("../models/Center");
const CenterSeller = require("../models/CenterSeller");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

/**
 * Helper function to upload base64 image to Cloudinary
 */
const uploadToCloudinary = async (base64String, folderName = "centers") => {
    try {
        if (!base64String || typeof base64String !== "string" || !base64String.startsWith("data:image/")) {
            return base64String;
        }

        const uploadResult = await cloudinary.uploader.upload(base64String, {
            folder: `gaonbazar/${folderName}`,
            resource_type: "image"
        });

        return uploadResult.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * @desc    Upload center image
 * @route   POST /api/centers/upload-image
 * @access  Private (Admin)
 */
exports.uploadCenterImage = async (req, res, next) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image provided"
            });
        }

        const imageUrl = await uploadToCloudinary(image, "centers");
        return res.status(200).json({
            success: true,
            imageUrl
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new Center (Admin)
 * @route   POST /api/centers
 * @access  Private (Admin)
 */
exports.createCenter = async (req, res, next) => {
    try {
        const {
            centerName,
            image,
            address,
            pinCode,
            openingTime,
            helplineNumber,
            director,
            directorName,
            directorContact,
            directorEmail,
            directorDesignation,
            helpingStaff,
            helpingStaffName,
            helpingStaffContact,
            helpingStaffRole,
            workers,
            status
        } = req.body;

        // Validation
        if (!centerName || !address || !pinCode || !helplineNumber) {
            return res.status(400).json({
                success: false,
                message: "Center name, address, pinCode, and helplineNumber are required"
            });
        }

        // Support both structured object or flat parameters for director
        const directorObj = {
            name: (director && director.name) || directorName || "",
            contactNumber: (director && director.contactNumber) || directorContact || "",
            email: (director && director.email) || directorEmail || "",
            designation: (director && director.designation) || directorDesignation || "Center Director"
        };

        if (!directorObj.name) {
            return res.status(400).json({
                success: false,
                message: "Director / Main Head name is required"
            });
        }

        // Support both structured object or flat parameters for helping staff
        const helpingStaffObj = {
            name: (helpingStaff && helpingStaff.name) || helpingStaffName || "",
            contactNumber: (helpingStaff && helpingStaff.contactNumber) || helpingStaffContact || "",
            role: (helpingStaff && helpingStaff.role) || helpingStaffRole || "Assistant / Coordinator"
        };

        // Handle Image upload
        let imageUrl = image || "";
        if (imageUrl && imageUrl.startsWith("data:image/")) {
            imageUrl = await uploadToCloudinary(imageUrl, "centers");
        }

        // Parse workers if passed as string
        let workersList = [];
        if (workers) {
            if (typeof workers === "string") {
                try {
                    workersList = JSON.parse(workers);
                } catch (e) {
                    workersList = [];
                }
            } else if (Array.isArray(workers)) {
                workersList = workers;
            }
        }

        const center = await Center.create({
            centerName,
            image: imageUrl,
            address,
            pinCode,
            openingTime: openingTime || "09:00 AM - 06:00 PM",
            helplineNumber,
            director: directorObj,
            helpingStaff: helpingStaffObj,
            workers: workersList,
            status: status || "active",
            createdBy: req.user ? req.user._id : undefined
        });

        return res.status(201).json({
            success: true,
            message: "Center created successfully",
            data: center
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all centers (Public / Admin)
 * @route   GET /api/centers
 * @access  Public
 */
exports.getAllCenters = async (req, res, next) => {
    try {
        const { search, pinCode, status, page = 1, limit = 50 } = req.query;

        const filter = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        if (pinCode) {
            filter.pinCode = pinCode.trim();
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { centerName: regex },
                { address: regex },
                { pinCode: regex },
                { "director.name": regex },
                { "helpingStaff.name": regex }
            ];
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const total = await Center.countDocuments(filter);

        const centers = await Center.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10))
            .populate("createdBy", "name mobile email role");

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)),
            data: centers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single center by ID
 * @route   GET /api/centers/:id
 * @access  Public
 */
exports.getCenterById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Center ID"
            });
        }

        const center = await Center.findById(id).populate("createdBy", "name mobile email");

        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: center
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a Center (Admin)
 * @route   PUT /api/centers/:id
 * @access  Private (Admin)
 */
exports.updateCenter = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Center ID"
            });
        }

        const center = await Center.findById(id);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        const {
            centerName,
            image,
            address,
            pinCode,
            openingTime,
            helplineNumber,
            director,
            directorName,
            directorContact,
            directorEmail,
            directorDesignation,
            helpingStaff,
            helpingStaffName,
            helpingStaffContact,
            helpingStaffRole,
            workers,
            status
        } = req.body;

        if (centerName) center.centerName = centerName;
        if (address) center.address = address;
        if (pinCode) center.pinCode = pinCode;
        if (openingTime) center.openingTime = openingTime;
        if (helplineNumber) center.helplineNumber = helplineNumber;
        if (status) center.status = status;

        // Update image if new base64 provided
        if (image) {
            if (image.startsWith("data:image/")) {
                center.image = await uploadToCloudinary(image, "centers");
            } else {
                center.image = image;
            }
        }

        // Update Director
        if (director) {
            center.director = {
                ...center.director.toObject(),
                ...director
            };
        } else {
            if (directorName) center.director.name = directorName;
            if (directorContact !== undefined) center.director.contactNumber = directorContact;
            if (directorEmail !== undefined) center.director.email = directorEmail;
            if (directorDesignation) center.director.designation = directorDesignation;
        }

        // Update Helping Staff
        if (helpingStaff) {
            center.helpingStaff = {
                ...center.helpingStaff.toObject(),
                ...helpingStaff
            };
        } else {
            if (helpingStaffName !== undefined) center.helpingStaff.name = helpingStaffName;
            if (helpingStaffContact !== undefined) center.helpingStaff.contactNumber = helpingStaffContact;
            if (helpingStaffRole !== undefined) center.helpingStaff.role = helpingStaffRole;
        }

        // Update Workers array if explicitly passed
        if (workers !== undefined) {
            let workersList = workers;
            if (typeof workers === "string") {
                try {
                    workersList = JSON.parse(workers);
                } catch (e) {
                    workersList = center.workers;
                }
            }
            if (Array.isArray(workersList)) {
                center.workers = workersList;
            }
        }

        const updatedCenter = await center.save();

        return res.status(200).json({
            success: true,
            message: "Center updated successfully",
            data: updatedCenter
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a Center (Admin)
 * @route   DELETE /api/centers/:id
 * @access  Private (Admin)
 */
exports.deleteCenter = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Center ID"
            });
        }

        const center = await Center.findByIdAndDelete(id);

        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Center deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a worker to a specific Center (Admin)
 * @route   POST /api/centers/:id/workers
 * @access  Private (Admin)
 */
exports.addWorkerToCenter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, contactNumber, email, status } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Worker name is required"
            });
        }

        const center = await Center.findById(id);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        const newWorker = {
            name: name.trim(),
            role: (role && role.trim()) || "Worker",
            contactNumber: (contactNumber && contactNumber.trim()) || "",
            email: (email && email.trim()) || "",
            status: status || "active",
            joiningDate: new Date()
        };

        center.workers.push(newWorker);
        await center.save();

        return res.status(201).json({
            success: true,
            message: "Worker added to center successfully",
            data: center.workers[center.workers.length - 1],
            center
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a worker in a Center (Admin)
 * @route   PUT /api/centers/:id/workers/:workerId
 * @access  Private (Admin)
 */
exports.updateWorkerInCenter = async (req, res, next) => {
    try {
        const { id, workerId } = req.params;
        const { name, role, contactNumber, email, status } = req.body;

        const center = await Center.findById(id);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        const worker = center.workers.id(workerId);
        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found in this center"
            });
        }

        if (name) worker.name = name.trim();
        if (role !== undefined) worker.role = role.trim();
        if (contactNumber !== undefined) worker.contactNumber = contactNumber.trim();
        if (email !== undefined) worker.email = email.trim();
        if (status) worker.status = status;

        await center.save();

        return res.status(200).json({
            success: true,
            message: "Worker updated successfully",
            data: worker,
            center
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove a worker from a Center (Admin)
 * @route   DELETE /api/centers/:id/workers/:workerId
 * @access  Private (Admin)
 */
exports.removeWorkerFromCenter = async (req, res, next) => {
    try {
        const { id, workerId } = req.params;

        const center = await Center.findById(id);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        const worker = center.workers.id(workerId);
        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found in this center"
            });
        }

        worker.deleteOne();
        await center.save();

        return res.status(200).json({
            success: true,
            message: "Worker removed successfully",
            center
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a farmer/seller produce entry to a center (Auto-generates 4-digit token)
 * @route   POST /api/centers/:id/sellers
 * @access  Private (Admin)
 */
exports.addSellerEntry = async (req, res, next) => {
    try {
        const { id: centerId } = req.params;
        const {
            farmerName,
            farmerMobile,
            village,
            cropName,
            variety,
            quantity,
            unit = "Quintal",
            pricePerQuintal,
            paymentMode = "Cash",
            paymentStatus = "Paid",
            paidAmount,
            dueAmount,
            transactionId,
            bankName,
            accountNumber,
            ifscCode,
            weighedBy,
            notes,
            status = "Payment Completed"
        } = req.body;

        if (!farmerName || !farmerMobile || !cropName || !quantity || !pricePerQuintal) {
            return res.status(400).json({
                success: false,
                message: "Farmer Name, Mobile, Crop Name, Quantity, and Price per Quintal are required"
            });
        }

        const center = await Center.findById(centerId);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        // Generate auto 4-digit token number for this center starting from 1001
        const lastEntry = await CenterSeller.findOne({ center: centerId })
            .sort({ createdAt: -1 })
            .select("tokenNumber");

        let nextTokenNum = 1001;
        if (lastEntry && lastEntry.tokenNumber) {
            const parsed = parseInt(lastEntry.tokenNumber, 10);
            if (!isNaN(parsed) && parsed >= 1001) {
                nextTokenNum = parsed + 1;
            } else {
                const count = await CenterSeller.countDocuments({ center: centerId });
                nextTokenNum = 1001 + count;
            }
        } else {
            const count = await CenterSeller.countDocuments({ center: centerId });
            nextTokenNum = 1001 + count;
        }
        const tokenNumber = String(nextTokenNum);

        // Check if a Farmer user exists with this mobile; if not, auto-create farmer account
        let farmerUser = await User.findOne({ mobile: farmerMobile.trim() });
        if (!farmerUser) {
            try {
                farmerUser = await User.create({
                    name: farmerName.trim(),
                    mobile: farmerMobile.trim(),
                    role: "farmer",
                    password: "Farmer@" + farmerMobile.trim().slice(-4),
                    status: "active",
                    isVerified: true
                });
            } catch (userErr) {
                console.warn("Could not auto-create user for farmer:", userErr.message);
            }
        }

        const numQty = parseFloat(quantity);
        const numPrice = parseFloat(pricePerQuintal);
        const totalAmount = Math.round(numQty * numPrice * 100) / 100;

        const actualPaid = paidAmount !== undefined ? parseFloat(paidAmount) : (paymentStatus === "Paid" ? totalAmount : 0);
        const actualDue = dueAmount !== undefined ? parseFloat(dueAmount) : (totalAmount - actualPaid);

        const sellerEntry = await CenterSeller.create({
            center: centerId,
            tokenNumber,
            farmer: farmerUser ? farmerUser._id : undefined,
            farmerName: farmerName.trim(),
            farmerMobile: farmerMobile.trim(),
            village: (village && village.trim()) || "",
            cropName: cropName.trim(),
            variety: (variety && variety.trim()) || "Standard / Grade A",
            quantity: numQty,
            unit: unit || "Quintal",
            pricePerQuintal: numPrice,
            totalAmount,
            paymentDetails: {
                paymentMode: paymentMode || "Cash",
                paymentStatus: paymentStatus || "Paid",
                paidAmount: actualPaid,
                dueAmount: actualDue > 0 ? actualDue : 0,
                transactionId: transactionId || "",
                bankName: bankName || "",
                accountNumber: accountNumber || "",
                ifscCode: ifscCode || ""
            },
            status: status || "Payment Completed",
            weighedBy: weighedBy || "",
            notes: notes || "",
            entryDate: new Date(),
            createdBy: req.user ? req.user._id : undefined
        });

        return res.status(201).json({
            success: true,
            message: `Farmer token #${tokenNumber} generated and entry recorded successfully`,
            data: sellerEntry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all farmer seller entries for a specific center
 * @route   GET /api/centers/:id/sellers
 * @access  Public / Admin
 */
exports.getCenterSellerEntries = async (req, res, next) => {
    try {
        const { id: centerId } = req.params;
        const { search, cropName, paymentStatus } = req.query;

        const filter = { center: centerId };

        if (paymentStatus && paymentStatus !== "all") {
            filter["paymentDetails.paymentStatus"] = paymentStatus;
        }

        if (cropName && cropName !== "all") {
            filter.cropName = new RegExp(cropName.trim(), "i");
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { tokenNumber: regex },
                { farmerName: regex },
                { farmerMobile: regex },
                { cropName: regex },
                { village: regex }
            ];
        }

        const entries = await CenterSeller.find(filter)
            .sort({ createdAt: -1 })
            .populate("farmer", "name mobile role");

        // Metrics for summary cards
        const totalSellers = entries.length;
        const totalQuantityQuintal = Math.round(entries.reduce((sum, e) => sum + (e.quantity || 0), 0) * 100) / 100;
        const totalPayout = Math.round(entries.reduce((sum, e) => sum + (e.totalAmount || 0), 0) * 100) / 100;
        const totalPaid = Math.round(entries.reduce((sum, e) => sum + ((e.paymentDetails && e.paymentDetails.paidAmount) || 0), 0) * 100) / 100;
        const totalDue = Math.round(entries.reduce((sum, e) => sum + ((e.paymentDetails && e.paymentDetails.dueAmount) || 0), 0) * 100) / 100;

        return res.status(200).json({
            success: true,
            summary: {
                totalSellers,
                totalQuantityQuintal,
                totalPayout,
                totalPaid,
                totalDue
            },
            data: entries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single seller entry by ID
 * @route   GET /api/centers/sellers/:entryId
 * @access  Public / Admin
 */
exports.getSellerEntryById = async (req, res, next) => {
    try {
        const { entryId } = req.params;
        const entry = await CenterSeller.findById(entryId)
            .populate("center")
            .populate("farmer", "name mobile role");

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Seller entry not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a seller entry
 * @route   DELETE /api/centers/sellers/:entryId
 * @access  Private (Admin)
 */
exports.deleteSellerEntry = async (req, res, next) => {
    try {
        const { entryId } = req.params;
        const entry = await CenterSeller.findByIdAndDelete(entryId);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Seller entry not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Seller entry deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

