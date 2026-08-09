const News = require("../models/News");
const NewsType = require("../models/NewsType");
const cloudinary = require("../config/cloudinary");

/**
 * Helper function to upload base64 image to Cloudinary
 */
const uploadToCloudinary = async (base64String, folderName = "news") => {
    try {
        if (!base64String || typeof base64String !== "string" || !base64String.startsWith("data:image/")) {
            return base64String;
        }

        const uploadResult = await cloudinary.uploader.upload(base64String, {
            folder: `gaonbazar/${folderName}`,
            resource_type: "image"
        });

        return uploadResult.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Endpoint for direct image upload to Cloudinary
 * POST /api/news/upload-image
 */
exports.uploadNewsImage = async (req, res, next) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image provided"
            });
        }

        const imageUrl = await uploadToCloudinary(image, "news");

        res.json({
            success: true,
            imageUrl
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new News Article
 * POST /api/news
 */
exports.createNews = async (req, res, next) => {
    try {
        const {
            title,
            slug,
            shortDescription,
            description,
            newsType,
            image,
            status,
            isFeatured,
            author,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        if (!title || !description || !newsType) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, content description, and select a news type category."
            });
        }

        // Verify NewsType exists
        const newsTypeExists = await NewsType.findById(newsType);
        if (!newsTypeExists) {
            return res.status(400).json({
                success: false,
                message: "Selected news type category does not exist."
            });
        }

        // Upload image to Cloudinary if base64
        let uploadedImageUrl = "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80";
        if (image) {
            uploadedImageUrl = await uploadToCloudinary(image, "news");
        }

        // Generate slug
        const generatedSlug = (slug || title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        const news = await News.create({
            title,
            slug: generatedSlug,
            shortDescription: shortDescription || "",
            description,
            newsType,
            image: uploadedImageUrl,
            status: status || "Published",
            isFeatured: isFeatured || false,
            author: author || "GaonBazar News Desk",
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || shortDescription || title,
            metaKeywords: metaKeywords || "",
            publishedAt: Date.now()
        });

        const populatedNews = await News.findById(news._id).populate("newsType", "title slug");

        res.status(201).json({
            success: true,
            message: "News article created successfully",
            data: populatedNews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all News Articles (with filtering, search, and pagination)
 * GET /api/news
 */
exports.getNews = async (req, res, next) => {
    try {
        const { newsType, status, search, featured } = req.query;
        let query = {};

        if (newsType && newsType !== "All") {
            query.newsType = newsType;
        }

        if (status && status !== "All") {
            query.status = status;
        }

        if (featured === "true") {
            query.isFeatured = true;
        }

        if (search) {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { title: searchRegex },
                { shortDescription: searchRegex },
                { description: searchRegex },
                { metaKeywords: searchRegex }
            ];
        }

        const newsList = await News.find(query)
            .populate("newsType", "title slug")
            .sort({ publishedAt: -1, createdAt: -1 });

        const stats = {
            total: await News.countDocuments(),
            published: await News.countDocuments({ status: "Published" }),
            draft: await News.countDocuments({ status: "Draft" }),
            featured: await News.countDocuments({ isFeatured: true })
        };

        res.json({
            success: true,
            count: newsList.length,
            stats,
            data: newsList
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get News Article by ID or Slug
 * GET /api/news/:id
 */
exports.getNewsByIdOrSlug = async (req, res, next) => {
    try {
        const { id } = req.params;
        let news;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            news = await News.findById(id).populate("newsType", "title slug");
        } else {
            news = await News.findOne({ slug: id }).populate("newsType", "title slug");
        }

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News article not found"
            });
        }

        // Increment view count
        news.views += 1;
        await news.save();

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update News Article
 * PUT /api/news/:id
 */
exports.updateNews = async (req, res, next) => {
    try {
        const {
            title,
            slug,
            shortDescription,
            description,
            newsType,
            image,
            status,
            isFeatured,
            author,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News article not found"
            });
        }

        if (title) news.title = title;
        if (slug) {
            news.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        } else if (title && title !== news.title) {
            news.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        }

        if (shortDescription !== undefined) news.shortDescription = shortDescription;
        if (description) news.description = description;
        if (newsType) news.newsType = newsType;
        if (status) news.status = status;
        if (isFeatured !== undefined) news.isFeatured = isFeatured;
        if (author) news.author = author;

        // SEO Meta data
        if (metaTitle !== undefined) news.metaTitle = metaTitle;
        if (metaDescription !== undefined) news.metaDescription = metaDescription;
        if (metaKeywords !== undefined) news.metaKeywords = metaKeywords;

        // Handle image upload if base64 string provided
        if (image && image.startsWith("data:image/")) {
            news.image = await uploadToCloudinary(image, "news");
        } else if (image) {
            news.image = image;
        }

        await news.save();

        const updatedNews = await News.findById(news._id).populate("newsType", "title slug");

        res.json({
            success: true,
            message: "News article updated successfully",
            data: updatedNews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete News Article
 * DELETE /api/news/:id
 */
exports.deleteNews = async (req, res, next) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News article not found"
            });
        }

        res.json({
            success: true,
            message: "News article deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
