const NewsType = require("../models/NewsType");

/**
 * Get all News Types / Categories
 * GET /api/news-types
 */
exports.getNewsTypes = async (req, res, next) => {
    try {
        const { activeOnly } = req.query;
        const query = activeOnly === "true" ? { isActive: true } : {};

        const newsTypes = await NewsType.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: newsTypes.length,
            data: newsTypes
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new News Type
 * POST /api/news-types
 */
exports.createNewsType = async (req, res, next) => {
    try {
        const { title, description, isActive } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "News type title is required"
            });
        }

        const existing = await NewsType.findOne({ title: { $regex: new RegExp(`^${title}$`, "i") } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A news type with this title already exists"
            });
        }

        const newsType = await NewsType.create({
            title,
            description: description || "",
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: "News type created successfully",
            data: newsType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update News Type
 * PUT /api/news-types/:id
 */
exports.updateNewsType = async (req, res, next) => {
    try {
        const { title, description, isActive } = req.body;
        const newsType = await NewsType.findById(req.params.id);

        if (!newsType) {
            return res.status(404).json({
                success: false,
                message: "News type not found"
            });
        }

        if (title) newsType.title = title;
        if (description !== undefined) newsType.description = description;
        if (isActive !== undefined) newsType.isActive = isActive;

        await newsType.save();

        res.json({
            success: true,
            message: "News type updated successfully",
            data: newsType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete News Type
 * DELETE /api/news-types/:id
 */
exports.deleteNewsType = async (req, res, next) => {
    try {
        const newsType = await NewsType.findByIdAndDelete(req.params.id);

        if (!newsType) {
            return res.status(404).json({
                success: false,
                message: "News type not found"
            });
        }

        res.json({
            success: true,
            message: "News type deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
