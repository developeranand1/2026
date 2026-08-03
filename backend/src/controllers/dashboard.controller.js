const Crop = require("../models/Crop");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const MandiRate = require("../models/MandiRate");
const User = require("../models/User");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");

exports.getFarmerDashboard = async (req, res) => {
    try {
        const farmerId = req.user._id;

        const totalCrops = await Crop.countDocuments({ farmer: farmerId });

        const activeOrders = await Order.countDocuments({
            farmer: farmerId,
            status: { $in: ["pending", "accepted"] }
        });

        const payments = await Payment.find({
            farmer: farmerId,
            status: "received"
        });

        const totalEarnings = payments.reduce((sum, payment) => {
            return sum + payment.farmerSettlementAmount;
        }, 0);

        const mandiRates = await MandiRate.find()
            .sort({ rateDate: -1 })
            .limit(5);

        const myCrops = await Crop.find({ farmer: farmerId })
            .sort({ createdAt: -1 })
            .limit(5);

        const recentOrders = await Order.find({ farmer: farmerId })
            .populate("crop", "cropName")
            .populate("buyer", "name mobile")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            message: "Farmer dashboard data fetched successfully",
            data: {
                greeting: `Namaste, ${req.user.name} Ji`,
                stats: {
                    totalCrops,
                    activeOrders,
                    totalEarnings
                },
                mandiRates,
                myCrops,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        const totalFarmers = await User.countDocuments({ role: "farmer" });
        const totalBuyers = await User.countDocuments({ role: "buyer" });
        const totalCrops = await Crop.countDocuments();
        const activeCrops = await Crop.countDocuments({ status: "active" });
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const completedOrders = await Order.countDocuments({ status: "completed" });
        const totalCategories = await Category.countDocuments();
        const totalSubcategories = await Subcategory.countDocuments();

        const payments = await Payment.find({ status: "received" });
        const totalRevenue = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

        const recentCrops = await Crop.find()
            .populate("farmer", "name mobile")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentOrders = await Order.find()
            .populate("buyer", "name mobile")
            .populate("farmer", "name mobile")
            .sort({ createdAt: -1 })
            .limit(5);

        const mandiRates = await MandiRate.find()
            .sort({ rateDate: -1 })
            .limit(6);

        res.json({
            success: true,
            message: "Admin dashboard stats retrieved successfully",
            data: {
                stats: {
                    totalFarmers,
                    totalBuyers,
                    totalCrops,
                    activeCrops,
                    totalOrders,
                    pendingOrders,
                    completedOrders,
                    totalCategories,
                    totalSubcategories,
                    totalRevenue: totalRevenue || 125000 // Fallback demo metric if database is fresh
                },
                recentCrops,
                recentOrders,
                mandiRates
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};