const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB Atlas connected successfully!");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB Atlas connection error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB Atlas disconnected.");
        });

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
    } catch (error) {
        console.error("MongoDB Atlas initial connection failed:", error.message);
        console.error("-> TIP: Ensure your IP is whitelisted in MongoDB Atlas Network Access (Allow Access from Anywhere: 0.0.0.0/0).");
    }
};

const getIsConnected = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, getIsConnected };