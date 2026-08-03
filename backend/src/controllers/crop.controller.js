const Crop = require("../models/Crop");
const FarmerProfile = require("../models/FarmerProfile");

exports.addCrop = async (req, res) => {
    try {
        const {
            cropName,
            grade,
            quantity,
            unit,
            expectedPrice,
            location
        } = req.body;

        const crop = await Crop.create({
            farmer: req.user._id,
            cropName,
            grade,
            quantity,
            unit,
            expectedPrice,
            location
        });

        await FarmerProfile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { totalCropsListed: 1 } }
        );

        res.status(201).json({
            success: true,
            message: "Crop published successfully",
            data: crop
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMyCrops = async (req, res) => {
    try {
        const crops = await Crop.find({ farmer: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: crops.length,
            data: crops
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCropById = async (req, res) => {
    try {
        const crop = await Crop.findOne({
            _id: req.params.id,
            farmer: req.user._id
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        res.json({
            success: true,
            data: crop
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateCrop = async (req, res) => {
    try {
        const crop = await Crop.findOneAndUpdate(
            {
                _id: req.params.id,
                farmer: req.user._id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        res.json({
            success: true,
            message: "Crop updated successfully",
            data: crop
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findOneAndDelete({
            _id: req.params.id,
            farmer: req.user._id
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        await FarmerProfile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { totalCropsListed: -1 } }
        );

        res.json({
            success: true,
            message: "Crop deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};