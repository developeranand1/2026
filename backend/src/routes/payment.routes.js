const express = require("express");
const router = express.Router();
const {
    getRazorpayKey,
    createListingOrder,
    activateFarmerListingAccess,
    verifyListingPayment,
    getFarmerListingStatus,
    getFarmerPayments
} = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

// Public / Key Config
router.get("/key", getRazorpayKey);
router.get("/config", getRazorpayKey);

// Order creation & payment verification
router.post("/create-order", createListingOrder);
router.post("/activate-unlimited-listing", activateFarmerListingAccess);
router.post("/verify-listing-payment", verifyListingPayment);

// Listing Access Status Check
router.get("/listing-status", getFarmerListingStatus);
router.get("/listing-status/:userId", getFarmerListingStatus);

// Farmer transactions / earnings
router.get("/farmer-payments", protect, getFarmerPayments);

module.exports = router;
