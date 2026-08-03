const express = require("express");
const router = express.Router();

const {
    registerFarmer,
    registerBuyer,
    register,
    login,
    seedAdmin
} = require("../controllers/auth.controller");

router.post("/register/farmer", registerFarmer);
router.post("/register/buyer", registerBuyer);
router.post("/register", register);
router.post("/login", login);
router.post("/seed-admin", seedAdmin);
router.get("/seed-admin", seedAdmin);

module.exports = router;