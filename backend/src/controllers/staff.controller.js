const Staff = require("../models/Staff");
const User = require("../models/User");
const FarmerProfile = require("../models/FarmerProfile");
const BuyerProfile = require("../models/BuyerProfile");
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

        const staffList = await Staff.find(query).sort({ createdAt: -1 }).lean();

        // Aggregate registered farmers & buyers count per staff member
        const staffIds = staffList.map(s => s._id);
        const regStats = await User.aggregate([
            { $match: { registeredBy: { $in: staffIds } } },
            {
                $group: {
                    _id: { staffId: "$registeredBy", role: "$role" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {};
        regStats.forEach(item => {
            if (!item._id || !item._id.staffId) return;
            const sid = item._id.staffId.toString();
            if (!statsMap[sid]) {
                statsMap[sid] = { farmers: 0, buyers: 0, total: 0 };
            }
            if (item._id.role === "farmer") {
                statsMap[sid].farmers += item.count;
            } else if (item._id.role === "buyer") {
                statsMap[sid].buyers += item.count;
            }
            statsMap[sid].total += item.count;
        });

        const staffWithStats = staffList.map(s => {
            const sid = s._id.toString();
            const counts = statsMap[sid] || { farmers: 0, buyers: 0, total: 0 };
            return {
                ...s,
                farmersCount: counts.farmers,
                buyersCount: counts.buyers,
                totalRegistrations: counts.total
            };
        });

        res.json({
            success: true,
            count: staffWithStats.length,
            data: staffWithStats
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

/**
 * Register Farmer on field (Called by Field Officer / Staff)
 */
exports.registerFarmerByStaff = async (req, res) => {
    try {
        const {
            name,
            mobile,
            email,
            password,
            village,
            city,
            district,
            state,
            pincode,
            fatherName,
            aadhaarNumber,
            totalLand,
            landUnit,
            irrigationType,
            latitude,
            longitude,
            address
        } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({
                success: false,
                message: "Farmer name and mobile number are required"
            });
        }

        const cleanMobile = String(mobile).trim();
        const existing = await User.findOne({ mobile: cleanMobile });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `User with mobile number ${cleanMobile} is already registered (${existing.role})`
            });
        }

        const finalPassword = password && password.length >= 6 ? password : cleanMobile;

        const staffId = req.staff?._id || null;
        const staffArea = req.staff?.assignedArea || {};

        const user = await User.create({
            name: name.trim(),
            mobile: cleanMobile,
            email: email ? email.trim() : "",
            password: finalPassword,
            role: "farmer",
            isVerified: true, // In-person verification by field officer
            registeredBy: staffId,
            registrationSource: "field_app",
            registeredAtLocation: {
                latitude: Number(latitude) || null,
                longitude: Number(longitude) || null,
                address: address || `${village || ""}, ${district || ""}, ${state || ""}`.trim()
            }
        });

        const profile = await FarmerProfile.create({
            user: user._id,
            fatherName: fatherName ? fatherName.trim() : "",
            aadhaarNumber: aadhaarNumber ? aadhaarNumber.trim() : "",
            totalLand: totalLand ? String(totalLand).trim() : "",
            landUnit: landUnit || "Bigha",
            irrigationType: irrigationType || "Irrigated",
            location: {
                village: village ? village.trim() : "",
                city: city ? city.trim() : "",
                district: district ? district.trim() : (staffArea.district || ""),
                state: state ? state.trim() : (staffArea.state || "Uttar Pradesh"),
                pincode: pincode ? pincode.trim() : ""
            }
        });

        res.status(201).json({
            success: true,
            message: `Farmer ${user.name} registered successfully!`,
            data: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                isVerified: user.isVerified,
                profile
            }
        });
    } catch (error) {
        console.error("Register Farmer by Staff Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Register Buyer on field (Called by Field Officer / Staff)
 */
exports.registerBuyerByStaff = async (req, res) => {
    try {
        const {
            name,
            mobile,
            email,
            password,
            companyName,
            gstNumber,
            street,
            city,
            district,
            state,
            pincode,
            latitude,
            longitude,
            address
        } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({
                success: false,
                message: "Buyer name and mobile number are required"
            });
        }

        const cleanMobile = String(mobile).trim();
        const existing = await User.findOne({ mobile: cleanMobile });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `User with mobile number ${cleanMobile} is already registered (${existing.role})`
            });
        }

        const finalPassword = password && password.length >= 6 ? password : cleanMobile;
        const staffId = req.staff?._id || null;
        const staffArea = req.staff?.assignedArea || {};

        const user = await User.create({
            name: name.trim(),
            mobile: cleanMobile,
            email: email ? email.trim() : "",
            password: finalPassword,
            role: "buyer",
            isVerified: true,
            registeredBy: staffId,
            registrationSource: "field_app",
            registeredAtLocation: {
                latitude: Number(latitude) || null,
                longitude: Number(longitude) || null,
                address: address || `${street || ""}, ${district || ""}, ${state || ""}`.trim()
            }
        });

        const profile = await BuyerProfile.create({
            user: user._id,
            companyName: companyName ? companyName.trim() : "",
            gstNumber: gstNumber ? gstNumber.trim() : "",
            address: {
                street: street ? street.trim() : "",
                city: city ? city.trim() : "",
                district: district ? district.trim() : (staffArea.district || ""),
                state: state ? state.trim() : (staffArea.state || "Uttar Pradesh"),
                pincode: pincode ? pincode.trim() : ""
            }
        });

        res.status(201).json({
            success: true,
            message: `Buyer / Trader ${user.name} registered successfully!`,
            data: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                isVerified: user.isVerified,
                profile
            }
        });
    } catch (error) {
        console.error("Register Buyer by Staff Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get My Registrations (Farmers & Buyers registered by current staff member)
 */
exports.getMyRegistrations = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const { role, search } = req.query;

        const query = { registeredBy: staffId };
        if (role && role !== "all") {
            query.role = role;
        }
        if (search) {
            const cleanSearch = String(search).trim();
            // Look up matching profiles
            const matchingFarmers = await FarmerProfile.find({
                $or: [
                    { "location.village": { $regex: cleanSearch, $options: "i" } },
                    { "location.city": { $regex: cleanSearch, $options: "i" } },
                    { "location.district": { $regex: cleanSearch, $options: "i" } },
                    { fatherName: { $regex: cleanSearch, $options: "i" } }
                ]
            }).select("user").lean();

            const matchingBuyers = await BuyerProfile.find({
                $or: [
                    { companyName: { $regex: cleanSearch, $options: "i" } },
                    { gstNumber: { $regex: cleanSearch, $options: "i" } },
                    { "address.city": { $regex: cleanSearch, $options: "i" } },
                    { "address.district": { $regex: cleanSearch, $options: "i" } },
                    { "address.street": { $regex: cleanSearch, $options: "i" } }
                ]
            }).select("user").lean();

            const profileUserIds = [
                ...matchingFarmers.map(f => f.user),
                ...matchingBuyers.map(b => b.user)
            ];

            query.$or = [
                { name: { $regex: cleanSearch, $options: "i" } },
                { mobile: { $regex: cleanSearch, $options: "i" } },
                { _id: { $in: profileUserIds } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 }).lean();

        // Populate profiles
        const userIds = users.map(u => u._id);
        const farmerProfiles = await FarmerProfile.find({ user: { $in: userIds } }).lean();
        const buyerProfiles = await BuyerProfile.find({ user: { $in: userIds } }).lean();

        const farmerMap = new Map(farmerProfiles.map(p => [p.user.toString(), p]));
        const buyerMap = new Map(buyerProfiles.map(p => [p.user.toString(), p]));

        const populated = users.map(u => {
            const uid = u._id.toString();
            return {
                ...u,
                farmerProfile: farmerMap.get(uid) || null,
                buyerProfile: buyerMap.get(uid) || null
            };
        });

        const totalRegistered = await User.countDocuments({ registeredBy: staffId });
        const farmersRegistered = await User.countDocuments({ registeredBy: staffId, role: "farmer" });
        const buyersRegistered = await User.countDocuments({ registeredBy: staffId, role: "buyer" });

        res.json({
            success: true,
            stats: {
                total: totalRegistered,
                farmers: farmersRegistered,
                buyers: buyersRegistered
            },
            count: populated.length,
            data: populated
        });
    } catch (error) {
        console.error("Get My Registrations Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
