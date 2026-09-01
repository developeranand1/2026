require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Start listening immediately
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });

    // Connect to MongoDB in background
    connectDB().catch(err => {
        console.warn("MongoDB connection warning:", err.message);
    });
};

startServer();