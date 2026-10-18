const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const User = require("../models/User");

/**
 * Protects routes requiring an authenticated internal Staff member.
 * Checks Staff model first, but gracefully falls back to admin User for backward compatibility.
 */
const protectStaff = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing. Please sign in to internal portal."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "krisimarg-secret-2026");

        // 1. Look up in dedicated Staff model
        let staff = null;
        try {
            staff = await Staff.findById(decoded.id).select("-password");
        } catch (e) {
            staff = null;
        }

        if (staff) {
            if (staff.status !== "active") {
                return res.status(403).json({
                    success: false,
                    message: "Your staff account has been deactivated or suspended."
                });
            }
            req.staff = staff;
            req.user = staff; // For standard compatibility
            return next();
        }

        // 2. Fallback: check if existing admin User
        let user = null;
        try {
            user = await User.findById(decoded.id).select("-password");
        } catch (e) {
            user = null;
        }

        if (user && user.role === "admin") {
            // Treat as superadmin staff representation
            req.staff = {
                _id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                role: "superadmin",
                designation: "Administrator",
                department: "Executive",
                status: "active"
            };
            req.user = req.staff;
            return next();
        }

        // 3. Fallback for offline demo admin token
        if (decoded.id === "demo-admin-id") {
            req.staff = {
                _id: "demo-admin-id",
                name: "KrisiMarg Admin",
                mobile: "9999999999",
                role: "superadmin",
                designation: "Chief Administrator",
                department: "Executive",
                status: "active"
            };
            req.user = req.staff;
            return next();
        }

        return res.status(401).json({
            success: false,
            message: "Staff identity verification failed. Please login again."
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session token: " + error.message
        });
    }
};

/**
 * Role-Based Access Control (RBAC) guard
 * e.g. authorizeRoles('superadmin', 'admin', 'hr')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.staff) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access: staff context required."
            });
        }

        const normalizedRole = (req.staff.role || "").toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        // superadmin has access to everything
        if (normalizedRole === "superadmin" || allowedRoles.includes(normalizedRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Forbidden: role '${req.staff.role}' does not have sufficient permission for this resource.`
        });
    };
};

module.exports = {
    protectStaff,
    authorizeRoles
};
