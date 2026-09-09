const express = require("express");
const router = express.Router();
const ogController = require("../controllers/og.controller");

// Open Graph Social bot preview routes (WhatsApp, Facebook, Twitter, Telegram)
router.get("/product/:id", ogController.getCropOgPreview);
router.get("/news/:slug", ogController.getNewsOgPreview);
router.get("/api/og/product/:id", ogController.getCropOgPreview);
router.get("/api/og/news/:slug", ogController.getNewsOgPreview);

module.exports = router;
