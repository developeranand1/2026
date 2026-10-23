const User = require("../models/User");
const FarmerProfile = require("../models/FarmerProfile");
const BuyerProfile = require("../models/BuyerProfile");
const mongoose = require("mongoose");

/**
 * Get All Users with Profiles and Filter/Search Stats
 * GET /api/users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, status, search } = req.query;

        let query = {};

        // Role Filter (Exclude admins by default unless explicitly requested)
        if (role && role !== "all") {
            query.role = role;
        } else {
            query.role = { $ne: "admin" };
        }

        // Status Filter
        if (status && status !== "all") {
            query.status = status;
        }

        // Search Filter (name, mobile, email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .populate("registeredBy", "name mobile designation role department")
            .sort({ createdAt: -1 })
            .lean();

        // Fetch Farmer & Buyer Profiles
        const userIds = users.map(u => u._id);
        const farmerProfiles = await FarmerProfile.find({ user: { $in: userIds } }).lean();
        const buyerProfiles = await BuyerProfile.find({ user: { $in: userIds } }).lean();

        const farmerMap = new Map(farmerProfiles.map(p => [p.user.toString(), p]));
        const buyerMap = new Map(buyerProfiles.map(p => [p.user.toString(), p]));

        // Combine user objects with profile details
        const populatedUsers = users.map(user => {
            const userIdStr = user._id.toString();
            return {
                ...user,
                farmerProfile: farmerMap.get(userIdStr) || null,
                buyerProfile: buyerMap.get(userIdStr) || null
            };
        });

        // Compute Summary Stats
        const totalUsers = await User.countDocuments();
        const farmersCount = await User.countDocuments({ role: "farmer" });
        const buyersCount = await User.countDocuments({ role: "buyer" });
        const blockedCount = await User.countDocuments({ status: "blocked" });
        const verifiedCount = await User.countDocuments({ isVerified: true });

        res.json({
            success: true,
            count: populatedUsers.length,
            stats: {
                totalUsers,
                farmersCount,
                buyersCount,
                blockedCount,
                verifiedCount
            },
            data: populatedUsers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get User Details by ID or Mobile with Full Profile
 * GET /api/users/:id
 */
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id).lean();
        } else {
            user = await User.findOne({ mobile: id }).lean();
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let farmerProfile = null;
        let buyerProfile = null;

        if (user.role === "farmer") {
            farmerProfile = await FarmerProfile.findOne({ user: user._id }).lean();
        } else if (user.role === "buyer") {
            buyerProfile = await BuyerProfile.findOne({ user: user._id }).lean();
        }

        res.json({
            success: true,
            data: {
                ...user,
                farmerProfile,
                buyerProfile
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update User and Profile (Farmer or Buyer)
 * PUT /api/users/:id
 * PUT /api/users/profile/:id
 */
exports.updateUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id);
        } else {
            user = await User.findOne({ mobile: id });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const {
            name,
            email,
            mobile,
            // Farmer specific fields
            fatherName,
            aadhaarNumber,
            totalLand,
            landUnit,
            irrigationType,
            village,
            city,
            district,
            state,
            pincode,
            bankHolder,
            bankAccount,
            bankIfsc,
            bankName,
            passbookImage,
            location,
            bankDetails,
            // Buyer specific fields
            companyName,
            gstNumber,
            street,
            address
        } = req.body;

        // Check if mobile is being changed and is already taken
        if (mobile && mobile !== user.mobile) {
            const existingMobileUser = await User.findOne({ mobile, _id: { $ne: user._id } });
            if (existingMobileUser) {
                return res.status(400).json({ success: false, message: "Mobile number is already registered with another account" });
            }
            user.mobile = mobile;
        }

        if (name) user.name = name;
        if (email !== undefined) user.email = email;
        await user.save();

        let updatedFarmerProfile = null;
        let updatedBuyerProfile = null;

        if (user.role === "farmer") {
            const locData = {
                village: village !== undefined ? village : (location?.village || ""),
                city: city !== undefined ? city : (location?.city || ""),
                district: district !== undefined ? district : (location?.district || ""),
                state: state !== undefined ? state : (location?.state || ""),
                pincode: pincode !== undefined ? pincode : (location?.pincode || "")
            };

            const bankData = {
                accountHolderName: bankHolder !== undefined ? bankHolder : (bankDetails?.accountHolderName || ""),
                accountNumber: bankAccount !== undefined ? bankAccount : (bankDetails?.accountNumber || ""),
                ifscCode: bankIfsc !== undefined ? bankIfsc : (bankDetails?.ifscCode || ""),
                bankName: bankName !== undefined ? bankName : (bankDetails?.bankName || ""),
                passbookImage: passbookImage !== undefined ? passbookImage : (bankDetails?.passbookImage || "")
            };

            const updateFields = {
                location: locData,
                bankDetails: bankData
            };

            if (fatherName !== undefined) updateFields.fatherName = fatherName;
            if (aadhaarNumber !== undefined) updateFields.aadhaarNumber = aadhaarNumber;
            if (totalLand !== undefined) updateFields.totalLand = totalLand;
            if (landUnit !== undefined) updateFields.landUnit = landUnit;
            if (irrigationType !== undefined) updateFields.irrigationType = irrigationType;

            updatedFarmerProfile = await FarmerProfile.findOneAndUpdate(
                { user: user._id },
                { $set: updateFields },
                { new: true, upsert: true }
            ).lean();
        } else if (user.role === "buyer") {
            const addrData = {
                street: street !== undefined ? street : (address?.street || ""),
                city: city !== undefined ? city : (address?.city || ""),
                district: district !== undefined ? district : (address?.district || ""),
                state: state !== undefined ? state : (address?.state || ""),
                pincode: pincode !== undefined ? pincode : (address?.pincode || "")
            };

            const buyerUpdate = {
                address: addrData
            };
            if (companyName !== undefined) buyerUpdate.companyName = companyName;
            if (gstNumber !== undefined) buyerUpdate.gstNumber = gstNumber;

            updatedBuyerProfile = await BuyerProfile.findOneAndUpdate(
                { user: user._id },
                { $set: buyerUpdate },
                { new: true, upsert: true }
            ).lean();
        }

        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                ...safeUser,
                farmerProfile: updatedFarmerProfile,
                buyerProfile: updatedBuyerProfile
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Update User Status (active / blocked)
 * PATCH /api/users/:id/status
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "blocked"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: `User status updated to ${status}`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update User Verification (isVerified: true / false)
 * PATCH /api/users/:id/verification
 */
exports.updateUserVerification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { isVerified: Boolean(isVerified) },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: `User verification updated`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete User and Profile
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Clean up profile documents
        await FarmerProfile.deleteMany({ user: id });
        await BuyerProfile.deleteMany({ user: id });

        res.json({
            success: true,
            message: "User and associated profile deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
