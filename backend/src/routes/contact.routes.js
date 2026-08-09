const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Public endpoint for submitting contact form
router.post("/", contactController.createContactInquiry);

// Admin endpoints for managing inquiries
router.get("/", contactController.getAllContactInquiries);
router.get("/:id", contactController.getContactInquiryById);
router.put("/:id", contactController.updateContactInquiry);
router.delete("/:id", contactController.deleteContactInquiry);

module.exports = router;
