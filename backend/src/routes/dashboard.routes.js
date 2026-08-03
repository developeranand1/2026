const express = require("express");
const router = express.Router();

const {
    getFarmerDashboard,
    getAdminDashboard
} = require("../controllers/dashboard.controller");

const { protect } = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get(
    "/farmer",
    protect,
    authorizeRoles("farmer"),
    getFarmerDashboard
);

router.get(
    "/admin",
    getAdminDashboard
);

module.exports = router;