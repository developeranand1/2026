const express = require("express");
const router = express.Router();
const newsController = require("../controllers/news.controller");

router.post("/upload-image", newsController.uploadNewsImage);

router.get("/", newsController.getNews);
router.get("/:id", newsController.getNewsByIdOrSlug);
router.post("/", newsController.createNews);
router.put("/:id", newsController.updateNews);
router.delete("/:id", newsController.deleteNews);

module.exports = router;
