const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const cropRoutes = require("./routes/crop.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const mandiRateRoutes = require("./routes/mandiRate.routes");
const categoryRoutes = require("./routes/category.routes");
const contactRoutes = require("./routes/contact.routes");
const newsTypeRoutes = require("./routes/newsType.routes");
const newsRoutes = require("./routes/news.routes");
const userRoutes = require("./routes/user.routes");
const weatherRoutes = require("./routes/weather.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());

// Increase JSON and URL-encoded payload limit to 50MB for Cloudinary base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "GaonBazar API is running"
    });
});

// Mount routes on /api
app.use("/api/auth", authRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mandi-rates", mandiRateRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/news-types", newsTypeRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/weather", weatherRoutes);

// Also mount routes on /api/v1 to support v1 endpoints seamlessly
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/crops", cropRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/mandi-rates", mandiRateRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/news-types", newsTypeRoutes);
app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/weather", weatherRoutes);

app.use(errorMiddleware);

module.exports = app;