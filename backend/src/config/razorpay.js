const Razorpay = require("razorpay");

const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TilkpmSAP3Z4bk";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "KKjSc6A5UnuAJk0b9BtEeOzh";

    return new Razorpay({
        key_id,
        key_secret
    });
};

module.exports = { getRazorpayInstance };
