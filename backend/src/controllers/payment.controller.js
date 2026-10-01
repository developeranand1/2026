const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Crop = require("../models/Crop");
const Category = require("../models/Category");
const FarmerProfile = require("../models/FarmerProfile");
const { getRazorpayInstance } = require("../config/razorpay");

/**
 * Get Public Razorpay Key ID
 * GET /api/payment/key
 */
exports.getRazorpayKey = (req, res) => {
    res.json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TilkpmSAP3Z4bk"
    });
};

/**
 * Check if Farmer has Paid ₹99 Listing Activation Fee
 * GET /api/payment/listing-status
 */
exports.getFarmerListingStatus = async (req, res, next) => {
    try {
        const userId = (req.user && req.user._id) ? req.user._id : (req.query.userId || req.params.userId);
        const mobile = req.query.mobile || (req.user && req.user.mobile);

        if (!userId && !mobile) {
            return res.json({ success: true, hasPaidListingFee: false });
        }

        let user = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }
        if (!user && mobile) {
            user = await User.findOne({ mobile });
        }

        if (!user) {
            return res.json({ success: true, hasPaidListingFee: false });
        }

        const hasAccess = user.role === "admin" || !!user.hasPaidListingFee;

        res.json({
            success: true,
            hasPaidListingFee: hasAccess,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                hasPaidListingFee: hasAccess
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Razorpay Order for ₹99 Farmer Listing Activation Fee
 * POST /api/payment/create-order
 */
exports.createListingOrder = async (req, res, next) => {
    try {
        const razorpay = getRazorpayInstance();
        const amount = Number(req.body.amount) || 99; // default ₹99
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            notes: {
                purpose: "crop_listing_fee",
                title: req.body.cropName || "Unlimited Produce Listing Activation",
                farmerName: req.body.farmerName || "",
                farmerMobile: req.body.farmerMobile || ""
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TilkpmSAP3Z4bk"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Activate Farmer Unlimited Listing Access after ₹99 Payment
 * POST /api/payment/activate-unlimited-listing
 */
exports.activateFarmerListingAccess = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            mobile,
            name
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        // Verify Razorpay HMAC signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "KKjSc6A5UnuAJk0b9BtEeOzh";
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed"
            });
        }

        // Find user by userId or mobile
        let user = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }
        if (!user && mobile) {
            user = await User.findOne({ mobile });
        }

        if (user) {
            user.hasPaidListingFee = true;
            user.listingFeePaymentId = razorpay_payment_id;
            user.listingFeePaidAt = new Date();
            await user.save();

            await FarmerProfile.findOneAndUpdate(
                { user: user._id },
                {
                    hasPaidListingFee: true,
                    listingFeePaymentId: razorpay_payment_id,
                    listingFeePaidAt: new Date()
                },
                { upsert: false }
            );
        }

        // Save Payment record for audit
        const paymentRecord = await Payment.create({
            farmer: user ? user._id : undefined,
            farmerName: name || (user && user.name) || "Farmer",
            farmerMobile: mobile || (user && user.mobile) || "",
            amount: 99,
            currency: "INR",
            purpose: "crop_listing_fee",
            paymentMode: "Razorpay",
            status: "received",
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        res.json({
            success: true,
            message: "₹99 payment verified successfully! Unlimited crop produce listings unlocked.",
            data: {
                hasPaidListingFee: true,
                paymentId: razorpay_payment_id,
                user: user ? {
                    id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    role: user.role,
                    hasPaidListingFee: true
                } : null
            },
            payment: paymentRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify Razorpay Signature & Create Paid Crop Listing (Per Listing Support)
 * POST /api/payment/verify-listing-payment
 */
exports.verifyListingPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cropData
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        if (!cropData || !cropData.cropName) {
            return res.status(400).json({
                success: false,
                message: "Crop listing information is required"
            });
        }

        // Verify HMAC-SHA256 signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "KKjSc6A5UnuAJk0b9BtEeOzh";
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature verification failed"
            });
        }

        // Parse Crop Attributes
        const rawUserId = (req.user && req.user._id) ? req.user._id : (cropData.postedBy || undefined);
        const userId = (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) ? rawUserId : undefined;
        const userRole = (req.user && req.user.role) ? req.user.role : (cropData.postedByRole || "farmer");
        const userName = (req.user && req.user.name) ? req.user.name : (cropData.postedByName || "Farmer");
        const userMobile = (req.user && req.user.mobile) ? req.user.mobile : (cropData.postedByMobile || "");

        // Also activate the user's unlimited listing fee status
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                hasPaidListingFee: true,
                listingFeePaymentId: razorpay_payment_id,
                listingFeePaidAt: new Date()
            });
            await FarmerProfile.findOneAndUpdate({ user: userId }, {
                hasPaidListingFee: true,
                listingFeePaymentId: razorpay_payment_id,
                listingFeePaidAt: new Date()
            });
        }

        const imageList = Array.isArray(cropData.images) && cropData.images.length > 0
            ? cropData.images
            : (cropData.image ? [cropData.image] : []);
        const primaryImage = imageList.length > 0
            ? imageList[0]
            : (cropData.image || "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80");

        let origPrice = Number(cropData.originalPrice) || 0;
        let salePrice = Number(cropData.expectedPrice) || 0;
        let discPercent = Number(cropData.discountPercentage) || 0;

        if (origPrice > 0 && salePrice > 0 && origPrice > salePrice) {
            discPercent = Math.round(((origPrice - salePrice) / origPrice) * 100);
        } else if (origPrice > 0 && discPercent > 0) {
            salePrice = Math.round(origPrice * (1 - discPercent / 100));
        } else if (salePrice > 0 && origPrice === 0) {
            origPrice = salePrice;
        }

        const catName = cropData.category ? cropData.category.trim() : "Food Grains & Cereals";
        const subCatName = cropData.subcategory ? cropData.subcategory.trim() : "";

        // Auto-Register Category / Subcategory into DB if not present
        if (catName && catName !== "CUSTOM_NEW") {
            const existingCat = await Category.findOne({ name: { $regex: new RegExp(`^${catName}$`, "i") } });
            if (!existingCat) {
                await Category.create({
                    name: catName,
                    subcategories: subCatName ? [{ name: subCatName }] : []
                });
            } else if (subCatName) {
                if (!Array.isArray(existingCat.subcategories)) {
                    existingCat.subcategories = [];
                }
                const subExists = existingCat.subcategories.some(s => s && s.name && s.name.toLowerCase() === subCatName.toLowerCase());
                if (!subExists) {
                    existingCat.subcategories.push({ name: subCatName });
                    await existingCat.save();
                }
            }
        }

        let customSlug = cropData.slug;
        if (!customSlug) {
            const baseSlug = (cropData.cropName || "crop")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
            customSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        // Create Crop with isPaid=true & payment status recorded
        const crop = await Crop.create({
            postedBy: userId,
            postedByRole: userRole,
            postedByName: userName,
            postedByMobile: userMobile,
            type: cropData.type || "sell",
            cropName: cropData.cropName,
            slug: customSlug,
            category: catName,
            subcategory: subCatName,
            variety: cropData.variety || "",
            grade: cropData.grade || "Grade A",
            quantity: cropData.quantity || 1,
            unit: cropData.unit || "Qtl",
            originalPrice: origPrice,
            expectedPrice: salePrice,
            discountPercentage: discPercent,
            priceUnit: cropData.priceUnit || "Quintal",
            location: cropData.location || "Bihar",
            description: cropData.description || "",
            image: primaryImage,
            images: imageList,
            status: "active",
            isApproved: false,
            approvalStatus: "pending",
            isPaid: true,
            paymentAmount: 99,
            paymentStatus: "paid",
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
        });

        // Record Payment Audit
        const paymentRecord = await Payment.create({
            farmer: userId,
            farmerName: userName,
            farmerMobile: userMobile,
            crop: crop._id,
            amount: 99,
            currency: "INR",
            purpose: "crop_listing_fee",
            paymentMode: "Razorpay",
            status: "received",
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        if (userId && userRole === "farmer") {
            await FarmerProfile.findOneAndUpdate({ user: userId }, { $inc: { totalCropsListed: 1 } });
        }

        res.status(201).json({
            success: true,
            message: "Payment of ₹99 received successfully! Your crop produce has been listed.",
            data: crop,
            payment: paymentRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Farmer Payments / Earnings
 * GET /api/payment/farmer-payments
 */
exports.getFarmerPayments = async (req, res, next) => {
    try {
        const farmerId = req.user ? req.user._id : req.query.farmerId;
        if (!farmerId) {
            return res.json({ success: true, data: { totalEarnings: 0, transactions: [] } });
        }

        const payments = await Payment.find({ farmer: farmerId })
            .populate("order", "orderId totalAmount status")
            .populate("crop", "cropName category expectedPrice")
            .sort({ createdAt: -1 });

        const totalEarnings = payments
            .filter((p) => p.status === "received" && p.purpose === "order_payment")
            .reduce((sum, p) => sum + (p.farmerSettlementAmount || 0), 0);

        res.json({
            success: true,
            data: {
                totalEarnings,
                transactions: payments
            }
        });
    } catch (error) {
        next(error);
    }
};