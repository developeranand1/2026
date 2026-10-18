const Staff = require("../models/Staff");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "krisimarg-secret-2026", {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d"
    });
};

/**
 * Staff / HR / Admin Login
 */
exports.staffLogin = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide mobile number and password"
            });
        }

        // Demo fallback accounts for zero-friction setup / offline mode
        if (mobile === "9999999999" && password === "admin123") {
            let adminStaff = await Staff.findOne({ mobile }).select("+password");
            if (!adminStaff) {
                adminStaff = await Staff.create({
                    name: "KrisiMarg Founder & CEO",
                    mobile: "9999999999",
                    email: "ceo@krisimarg.com",
                    password: "admin123",
                    role: "superadmin",
                    designation: "Chief Executive Officer",
                    department: "Executive",
                    status: "active"
                });
            }
            const token = generateToken(adminStaff._id);
            return res.json({
                success: true,
                message: "Super Admin Login Successful",
                token,
                data: {
                    id: adminStaff._id,
                    name: adminStaff.name,
                    mobile: adminStaff.mobile,
                    email: adminStaff.email,
                    role: adminStaff.role,
                    designation: adminStaff.designation,
                    department: adminStaff.department
                }
            });
        }

        const staff = await Staff.findOne({ mobile }).select("+password");

        if (!staff || !(await staff.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or credentials"
            });
        }

        if (staff.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "This account has been deactivated or suspended by HR."
            });
        }

        const token = generateToken(staff._id);

        res.json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: staff._id,
                name: staff.name,
                mobile: staff.mobile,
                email: staff.email,
                role: staff.role,
                designation: staff.designation,
                department: staff.department,
                assignedArea: staff.assignedArea,
                dailyExpenseLimit: staff.dailyExpenseLimit
            }
        });
    } catch (error) {
        console.error("Staff Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed: " + error.message
        });
    }
};

/**
 * Get current authenticated staff profile
 */
exports.getStaffProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.staff
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * List all staff members (Admin & HR view)
 */
exports.getAllStaff = async (req, res) => {
    try {
        const { role, department, status, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (department) query.department = department;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { designation: { $regex: search, $options: "i" } }
            ];
        }

        const staffList = await Staff.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: staffList.length,
            data: staffList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new staff member (Admin / HR)
 */
exports.createStaff = async (req, res) => {
    try {
        const {
            name,
            mobile,
            email,
            password,
            role,
            designation,
            department,
            salary,
            assignedArea,
            dailyExpenseLimit,
            emergencyContact
        } = req.body;

        if (!name || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile, and password are required"
            });
        }

        const existing = await Staff.findOne({ mobile });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Staff member with this mobile number already exists"
            });
        }

        const newStaff = await Staff.create({
            name,
            mobile,
            email: email || "",
            password,
            role: role || "field_officer",
            designation: designation || "Field Officer",
            department: department || "Operations",
            salary: Number(salary) || 0,
            assignedArea: assignedArea || {},
            dailyExpenseLimit: Number(dailyExpenseLimit) || 2000,
            emergencyContact: emergencyContact || ""
        });

        res.status(201).json({
            success: true,
            message: "Staff member created successfully",
            data: {
                id: newStaff._id,
                name: newStaff.name,
                mobile: newStaff.mobile,
                role: newStaff.role,
                designation: newStaff.designation
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update staff details (Admin / HR)
 */
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If password is being updated, hash it
        if (updates.password) {
            delete updates.password; // Do not update password via generic put
        }

        const updatedStaff = await Staff.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedStaff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found"
            });
        }

        res.json({
            success: true,
            message: "Staff details updated successfully",
            data: updatedStaff
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Toggle staff active/suspended status
 */
exports.toggleStaffStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findById(id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        staff.status = staff.status === "active" ? "suspended" : "active";
        await staff.save();

        res.json({
            success: true,
            message: `Staff status changed to ${staff.status}`,
            data: staff
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Seeds sample staff members for immediate testing if collection is empty
 */
exports.seedStaffMembers = async (req, res) => {
    try {
        const count = await Staff.countDocuments();
        if (count > 0) {
            return res.json({
                success: true,
                message: `Staff database already has ${count} records.`,
                count
            });
        }

        const seeds = [
            {
                name: "Anand Sharma (CEO)",
                mobile: "9999999999",
                email: "ceo@krisimarg.com",
                password: "admin123",
                role: "superadmin",
                designation: "Chief Executive Officer",
                department: "Executive",
                salary: 120000,
                status: "active"
            },
            {
                name: "Pooja Verma (HR Head)",
                mobile: "9876543210",
                email: "hr@krisimarg.com",
                password: "password123",
                role: "hr",
                designation: "HR Manager",
                department: "Human Resources",
                salary: 60000,
                status: "active"
            },
            {
                name: "Ramesh Kumar (Accountant)",
                mobile: "9876543211",
                email: "accounts@krisimarg.com",
                password: "password123",
                role: "accountant",
                designation: "Senior Accountant",
                department: "Finance",
                salary: 50000,
                status: "active"
            },
            {
                name: "Deepak Yadav (Field Officer)",
                mobile: "9876543212",
                email: "deepak.field@krisimarg.com",
                password: "password123",
                role: "field_officer",
                designation: "Senior Field Sourcing Officer",
                department: "Operations",
                salary: 32000,
                assignedArea: { district: "Sant Kabir Nagar", state: "Uttar Pradesh" },
                dailyExpenseLimit: 2500,
                status: "active"
            },
            {
                name: "Ravi Kishan (Field Officer)",
                mobile: "9876543213",
                email: "ravi.field@krisimarg.com",
                password: "password123",
                role: "field_officer",
                designation: "Field Procurement Agent",
                department: "Operations",
                salary: 28000,
                assignedArea: { district: "Gorakhpur", state: "Uttar Pradesh" },
                dailyExpenseLimit: 2000,
                status: "active"
            }
        ];

        for (const item of seeds) {
            await Staff.create(item);
        }

        res.json({
            success: true,
            message: "Seeded initial staff team (CEO, HR, Accountant, Field Officers)",
            count: seeds.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
