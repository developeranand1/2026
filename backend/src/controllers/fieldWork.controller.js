const FieldWork = require("../models/FieldWork");

/**
 * Helper to get YYYY-MM-DD
 */
const getTodayDateStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
};

/**
 * Start Field Shift (Mobile app or web check-in)
 */
exports.startWork = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const { latitude, longitude, accuracy, address, caption } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "GPS Latitude and Longitude are required to start field work."
            });
        }

        // Check if there is already an active session today
        const existingActive = await FieldWork.findOne({
            staff: staffId,
            status: "IN_PROGRESS"
        });

        if (existingActive) {
            return res.status(400).json({
                success: false,
                message: "You already have an active field session running. Please end it before starting a new one.",
                data: existingActive
            });
        }

        const newSession = await FieldWork.create({
            staff: staffId,
            date: getTodayDateStr(),
            startTime: new Date(),
            startLocation: {
                latitude: Number(latitude),
                longitude: Number(longitude),
                accuracy: Number(accuracy) || 0,
                address: address || `Lat: ${latitude}, Lng: ${longitude}`,
                timestamp: new Date()
            },
            startCaption: caption || "Started field duty",
            status: "IN_PROGRESS"
        });

        res.status(201).json({
            success: true,
            message: "Field duty started successfully. Location and timestamp recorded.",
            data: newSession
        });
    } catch (error) {
        console.error("Start Field Work Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * End Field Shift (Mobile app or web check-out)
 */
exports.endWork = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const { sessionId, latitude, longitude, accuracy, address, caption, summaryReport, distanceCoveredKm, farmersVisitedCount } = req.body;

        let session = null;
        if (sessionId) {
            session = await FieldWork.findOne({ _id: sessionId, staff: staffId });
        } else {
            session = await FieldWork.findOne({ staff: staffId, status: "IN_PROGRESS" }).sort({ startTime: -1 });
        }

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "No active field work session found to end."
            });
        }

        session.endTime = new Date();
        session.status = "COMPLETED";
        if (latitude !== undefined && longitude !== undefined) {
            session.endLocation = {
                latitude: Number(latitude),
                longitude: Number(longitude),
                accuracy: Number(accuracy) || 0,
                address: address || `Lat: ${latitude}, Lng: ${longitude}`,
                timestamp: new Date()
            };
        }
        session.endCaption = caption || "Completed day duty";
        if (summaryReport) session.summaryReport = summaryReport;
        if (distanceCoveredKm) session.distanceCoveredKm = Number(distanceCoveredKm);
        if (farmersVisitedCount) session.farmersVisitedCount = Number(farmersVisitedCount);

        await session.save();

        res.json({
            success: true,
            message: "Field duty ended successfully. Work summary and end location recorded.",
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get current active session for logged-in staff
 */
exports.getActiveSession = async (req, res) => {
    try {
        const activeSession = await FieldWork.findOne({
            staff: req.staff._id,
            status: "IN_PROGRESS"
        });

        res.json({
            success: true,
            hasActiveSession: !!activeSession,
            data: activeSession
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get personal field work history for logged-in staff
 */
exports.getMyFieldHistory = async (req, res) => {
    try {
        const history = await FieldWork.find({ staff: req.staff._id })
            .sort({ startTime: -1 })
            .limit(50);

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Admin / HR view: Get all staff field work sessions with filters
 */
exports.getAllFieldWork = async (req, res) => {
    try {
        const { date, staffId, status, limit = 100 } = req.query;
        const query = {};

        if (date) query.date = date;
        if (staffId) query.staff = staffId;
        if (status) query.status = status;

        const sessions = await FieldWork.find(query)
            .populate("staff", "name mobile designation department assignedArea")
            .sort({ startTime: -1 })
            .limit(Number(limit));

        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * HR verification of field work
 */
exports.verifyFieldWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const session = await FieldWork.findById(id);
        if (!session) {
            return res.status(404).json({ success: false, message: "Field session not found" });
        }

        session.verifiedByHr = true;
        session.hrRemarks = remarks || "Verified by HR";
        await session.save();

        res.json({
            success: true,
            message: "Field session verified by HR",
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
