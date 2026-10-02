const LevyRate = require("../models/LevyRate");
const MandiRate = require("../models/MandiRate");

/**
 * Default Initial Rates for Sant Kabir Nagar, Basti, and Gorakhpur Mandis
 */
const SEED_RATES = [
    // --- Sant Kabir Nagar (Khalilabad APMC Mandi) ---
    {
        state: "Uttar Pradesh",
        district: "Sant Kabir Nagar",
        city: "Khalilabad",
        municipality: "Khalilabad Nagar Palika",
        zone: "Basti Division",
        mandiName: "Khalilabad APMC Mandi",
        commodity: "Wheat",
        hindiName: "गेहूं (Sharbati)",
        cropName: "Wheat (गेहूं)",
        variety: "Sharbati Grade A",
        category: "Grains",
        rate: 2320,
        modalPrice: 2320,
        minPrice: 2200,
        maxPrice: 2410,
        pricePerQuintal: 2320,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+1.8%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Sant Kabir Nagar APMC Mandi Parishad",
        notes: "Daily arrivals steady with high millers demand in Khalilabad."
    },
    {
        state: "Uttar Pradesh",
        district: "Sant Kabir Nagar",
        city: "Khalilabad",
        municipality: "Khalilabad Nagar Palika",
        zone: "Basti Division",
        mandiName: "Khalilabad APMC Mandi",
        commodity: "Paddy (Rice)",
        hindiName: "धान (1121)",
        cropName: "Paddy (धान)",
        variety: "Basmati 1121",
        category: "Grains",
        rate: 2180,
        modalPrice: 2180,
        minPrice: 2050,
        maxPrice: 2260,
        pricePerQuintal: 2180,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+1.2%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Sant Kabir Nagar APMC Mandi Parishad",
        notes: "Government benchmark paddy rate."
    },
    {
        state: "Uttar Pradesh",
        district: "Sant Kabir Nagar",
        city: "Khalilabad",
        municipality: "Khalilabad Nagar Palika",
        zone: "Basti Division",
        mandiName: "Khalilabad APMC Mandi",
        commodity: "Mustard Seeds",
        hindiName: "सरसों (Pili)",
        cropName: "Mustard (सरसों)",
        variety: "Yellow Bold",
        category: "Oilseeds",
        rate: 5450,
        modalPrice: 5450,
        minPrice: 5200,
        maxPrice: 5650,
        pricePerQuintal: 5450,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+2.5%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Sant Kabir Nagar APMC Mandi Parishad",
        notes: "High oil content mustard seed trading."
    },
    {
        state: "Uttar Pradesh",
        district: "Sant Kabir Nagar",
        city: "Khalilabad",
        municipality: "Khalilabad Nagar Palika",
        zone: "Basti Division",
        mandiName: "Khalilabad APMC Mandi",
        commodity: "Potato",
        hindiName: "आलू (Desi)",
        cropName: "Potato (आलू)",
        variety: "Jyoti Desi",
        category: "Vegetables",
        rate: 1420,
        modalPrice: 1420,
        minPrice: 1300,
        maxPrice: 1550,
        pricePerQuintal: 1420,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "-0.8%",
        isUp: false,
        trend: "down",
        status: "active",
        source: "Sant Kabir Nagar APMC Mandi Parishad",
        notes: "Fresh cold storage stock released."
    },

    // --- Basti (Basti Mandi) ---
    {
        state: "Uttar Pradesh",
        district: "Basti",
        city: "Basti",
        municipality: "Basti Nagar Palika Parishad",
        zone: "Basti Division",
        mandiName: "Basti Mandi",
        commodity: "Wheat",
        hindiName: "गेहूं (Dara)",
        cropName: "Wheat (गेहूं)",
        variety: "Dara Grade A",
        category: "Grains",
        rate: 2280,
        modalPrice: 2280,
        minPrice: 2160,
        maxPrice: 2350,
        pricePerQuintal: 2280,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+0.9%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Basti Mandi Samiti Office",
        notes: "MSP procurement active."
    },
    {
        state: "Uttar Pradesh",
        district: "Basti",
        city: "Basti",
        municipality: "Basti Nagar Palika Parishad",
        zone: "Basti Division",
        mandiName: "Basti Mandi",
        commodity: "Paddy (Rice)",
        hindiName: "धान (Moti)",
        cropName: "Paddy (धान)",
        variety: "Common Moti",
        category: "Grains",
        rate: 2050,
        modalPrice: 2050,
        minPrice: 1950,
        maxPrice: 2140,
        pricePerQuintal: 2050,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+1.5%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Basti Mandi Samiti Office",
        notes: "Direct farmer auction arrivals."
    },
    {
        state: "Uttar Pradesh",
        district: "Basti",
        city: "Basti",
        municipality: "Basti Nagar Palika Parishad",
        zone: "Basti Division",
        mandiName: "Basti Mandi",
        commodity: "Green Pea",
        hindiName: "हरी मटर",
        cropName: "Green Pea (मटर)",
        variety: "Golden Pea",
        category: "Vegetables",
        rate: 3850,
        modalPrice: 3850,
        minPrice: 3500,
        maxPrice: 4100,
        pricePerQuintal: 3850,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+3.2%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Basti Mandi Samiti Office",
        notes: "Seasonal green peas high commercial demand."
    },

    // --- Gorakhpur (Gorakhpur Mandi) ---
    {
        state: "Uttar Pradesh",
        district: "Gorakhpur",
        city: "Gorakhpur",
        municipality: "Gorakhpur Municipal Corporation",
        zone: "Gorakhpur Division",
        mandiName: "Gorakhpur Mandi",
        commodity: "Wheat",
        hindiName: "गेहूं (Premium)",
        cropName: "Wheat (गेहूं)",
        variety: "Kundan / Sharbati",
        category: "Grains",
        rate: 2340,
        modalPrice: 2340,
        minPrice: 2220,
        maxPrice: 2420,
        pricePerQuintal: 2340,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+2.1%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Gorakhpur Krishi APMC Mandi Parishad",
        notes: "Primary regional grain market trading."
    },
    {
        state: "Uttar Pradesh",
        district: "Gorakhpur",
        city: "Gorakhpur",
        municipality: "Gorakhpur Municipal Corporation",
        zone: "Gorakhpur Division",
        mandiName: "Gorakhpur Mandi",
        commodity: "Mustard Seeds",
        hindiName: "सरसों (Bold)",
        cropName: "Mustard (सरसों)",
        variety: "Black Bold",
        category: "Oilseeds",
        rate: 5480,
        modalPrice: 5480,
        minPrice: 5250,
        maxPrice: 5680,
        pricePerQuintal: 5480,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+1.9%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Gorakhpur Krishi APMC Mandi Parishad",
        notes: "Strong demand from regional edible oil expellers."
    },
    {
        state: "Uttar Pradesh",
        district: "Gorakhpur",
        city: "Gorakhpur",
        municipality: "Gorakhpur Municipal Corporation",
        zone: "Gorakhpur Division",
        mandiName: "Gorakhpur Mandi",
        commodity: "Red Onion",
        hindiName: "प्याज (Nasik)",
        cropName: "Onion (प्याज)",
        variety: "Medium Red",
        category: "Vegetables",
        rate: 2720,
        modalPrice: 2720,
        minPrice: 2500,
        maxPrice: 2950,
        pricePerQuintal: 2720,
        rateUnit: "Quintal",
        unit: "Quintal",
        levyRate: 1.5,
        levyUnit: "%",
        calculationMethod: "APMC Mandi Cess / Trade Value",
        assessmentYear: "2026-2027",
        change: "+3.8%",
        isUp: true,
        trend: "up",
        status: "active",
        source: "Gorakhpur Krishi APMC Mandi Parishad",
        notes: "Wholesale arrivals from Maharashtra and local mandis."
    }
];

/**
 * Seed initial rates into DB if empty
 */
async function autoSeedRatesIfEmpty() {
    try {
        const count = await LevyRate.countDocuments();
        if (count === 0) {
            await LevyRate.insertMany(SEED_RATES);
            // Also mirror to MandiRate for unified compatibility
            for (const r of SEED_RATES) {
                await MandiRate.create({
                    cropName: r.cropName || r.commodity,
                    commodity: r.commodity,
                    hindiName: r.hindiName,
                    mandiName: r.mandiName,
                    location: `${r.district}, ${r.state}`,
                    district: r.district,
                    state: r.state,
                    pricePerQuintal: r.rate || r.modalPrice,
                    modalPrice: r.modalPrice || r.rate,
                    minPrice: r.minPrice,
                    maxPrice: r.maxPrice,
                    unit: r.unit || "Quintal",
                    change: r.change,
                    isUp: r.isUp,
                    trend: r.trend,
                    source: r.source,
                    arrivalDate: new Date().toLocaleDateString("en-IN")
                });
            }
            console.log("Auto-seeded initial APMC Mandi rates for Sant Kabir Nagar, Basti, and Gorakhpur.");
        }
    } catch (e) {
        console.error("Error auto-seeding levy/mandi rates:", e.message);
    }
}
autoSeedRatesIfEmpty();

/**
 * POST /api/admin/levy-rates
 * Create new Levy / Mandi Rate
 */
exports.createLevyRate = async (req, res) => {
    try {
        const data = req.body;
        // Normalize fields
        if (!data.rate && data.modalPrice) data.rate = data.modalPrice;
        if (!data.modalPrice && data.rate) data.modalPrice = data.rate;
        if (!data.cropName && data.commodity) data.cropName = data.commodity;
        if (!data.commodity && data.cropName) data.commodity = data.cropName;
        if (!data.mandiName && data.district) data.mandiName = `${data.district} APMC Mandi`;

        const newRecord = await LevyRate.create(data);

        // Also create / update in MandiRate collection so live search displays it immediately
        await MandiRate.create({
            cropName: newRecord.cropName || newRecord.commodity,
            commodity: newRecord.commodity,
            hindiName: newRecord.hindiName || newRecord.commodity,
            mandiName: newRecord.mandiName,
            location: `${newRecord.district || newRecord.city || ''}, ${newRecord.state || 'Uttar Pradesh'}`,
            district: newRecord.district,
            state: newRecord.state,
            pricePerQuintal: newRecord.rate || newRecord.modalPrice,
            modalPrice: newRecord.modalPrice || newRecord.rate,
            minPrice: newRecord.minPrice || Math.round((newRecord.rate || 2000) * 0.94),
            maxPrice: newRecord.maxPrice || Math.round((newRecord.rate || 2000) * 1.06),
            unit: newRecord.unit || newRecord.rateUnit || "Quintal",
            change: newRecord.change || "+0%",
            isUp: newRecord.isUp !== undefined ? newRecord.isUp : true,
            trend: newRecord.trend || "same",
            source: newRecord.source || "Official Admin APMC Feed",
            arrivalDate: new Date().toLocaleDateString("en-IN")
        });

        res.status(201).json({
            success: true,
            message: "Levy / Mandi rate created successfully",
            data: newRecord
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create rate: " + error.message
        });
    }
};

/**
 * GET /api/admin/levy-rates
 * List all rates with query filtering
 */
exports.getAllLevyRates = async (req, res) => {
    try {
        const { state, district, city, commodity, status, search } = req.query;
        const filter = {};

        if (state) filter.state = new RegExp(state, "i");
        if (district) filter.district = new RegExp(district, "i");
        if (city) filter.city = new RegExp(city, "i");
        if (commodity) filter.commodity = new RegExp(commodity, "i");
        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { commodity: new RegExp(search, "i") },
                { hindiName: new RegExp(search, "i") },
                { cropName: new RegExp(search, "i") },
                { district: new RegExp(search, "i") },
                { city: new RegExp(search, "i") },
                { mandiName: new RegExp(search, "i") }
            ];
        }

        const rates = await LevyRate.find(filter).sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: rates.length,
            data: rates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/admin/levy-rates/:id
 */
exports.getLevyRateById = async (req, res) => {
    try {
        const rate = await LevyRate.findById(req.params.id);
        if (!rate) {
            return res.status(404).json({
                success: false,
                message: "Levy rate not found"
            });
        }
        res.json({
            success: true,
            data: rate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * PUT /api/admin/levy-rates/:id
 */
exports.updateLevyRate = async (req, res) => {
    try {
        const updated = await LevyRate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Levy rate not found"
            });
        }

        res.json({
            success: true,
            message: "Levy rate updated successfully",
            data: updated
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * DELETE /api/admin/levy-rates/:id
 */
exports.deleteLevyRate = async (req, res) => {
    try {
        const deleted = await LevyRate.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Levy rate not found"
            });
        }

        res.json({
            success: true,
            message: "Levy rate deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * PATCH /api/admin/levy-rates/:id/status
 */
exports.updateLevyRateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !["active", "inactive", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value. Must be active, inactive, or pending"
            });
        }

        const rate = await LevyRate.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!rate) {
            return res.status(404).json({
                success: false,
                message: "Levy rate not found"
            });
        }

        res.json({
            success: true,
            message: `Status updated to ${status}`,
            data: rate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
