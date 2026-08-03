const Payment = require("../models/Payment");

exports.getFarmerPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ farmer: req.user._id })
            .populate("order", "orderId totalAmount status")
            .sort({ createdAt: -1 });

        const totalEarnings = payments
            .filter((payment) => payment.status === "received")
            .reduce((sum, payment) => sum + payment.farmerSettlementAmount, 0);

        res.json({
            success: true,
            data: {
                totalEarnings,
                transactions: payments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};