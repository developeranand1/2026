const Contact = require("../models/Contact");

/**
 * Public: Submit a new contact inquiry
 * POST /api/contact
 */
exports.createContactInquiry = async (req, res, next) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;

        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide full name, email, subject, and message."
            });
        }

        const inquiry = await Contact.create({
            fullName,
            email,
            phone: phone || "",
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: "Your message has been submitted successfully. Our team will contact you soon.",
            data: inquiry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get all contact inquiries
 * GET /api/contact
 */
exports.getAllContactInquiries = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status && status !== "All") {
            query.status = status;
        }

        if (search) {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { subject: searchRegex },
                { message: searchRegex }
            ];
        }

        const inquiries = await Contact.find(query).sort({ createdAt: -1 });

        const stats = {
            total: await Contact.countDocuments(),
            pending: await Contact.countDocuments({ status: "Pending" }),
            inProgress: await Contact.countDocuments({ status: "In Progress" }),
            contacted: await Contact.countDocuments({ status: "Contacted" }),
            resolved: await Contact.countDocuments({ status: "Resolved" })
        };

        res.json({
            success: true,
            count: inquiries.length,
            stats,
            data: inquiries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get contact inquiry by ID
 * GET /api/contact/:id
 */
exports.getContactInquiryById = async (req, res, next) => {
    try {
        const inquiry = await Contact.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found"
            });
        }

        res.json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Update contact status and admin remark
 * PUT /api/contact/:id
 */
exports.updateContactInquiry = async (req, res, next) => {
    try {
        const { status, adminRemark } = req.body;
        const inquiry = await Contact.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found"
            });
        }

        if (status) {
            inquiry.status = status;
            if (status !== "Pending" && !inquiry.contactedAt) {
                inquiry.contactedAt = new Date();
            }
        }

        if (adminRemark !== undefined) {
            inquiry.adminRemark = adminRemark;
        }

        await inquiry.save();

        res.json({
            success: true,
            message: "Inquiry updated successfully",
            data: inquiry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Delete contact inquiry
 * DELETE /api/contact/:id
 */
exports.deleteContactInquiry = async (req, res, next) => {
    try {
        const inquiry = await Contact.findByIdAndDelete(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found"
            });
        }

        res.json({
            success: true,
            message: "Inquiry deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
