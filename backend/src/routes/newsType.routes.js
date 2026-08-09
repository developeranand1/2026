const express = require("express");
const router = express.Router();
const newsTypeController = require("../controllers/newsType.controller");

router.get("/", newsTypeController.getNewsTypes);
router.post("/", newsTypeController.createNewsType);
router.put("/:id", newsTypeController.updateNewsType);
router.delete("/:id", newsTypeController.deleteNewsType);

module.exports = router;
