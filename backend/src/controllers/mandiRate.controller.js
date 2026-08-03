const MandiRate = require("../models/MandiRate");
const Crop = require("../models/Crop");

// State mapper for AGMARKNET
const STATE_MAP = {
    "andhra pradesh": "AP",
    "arunachal pradesh": "AR",
    "assam": "AS",
    "bihar": "BI",
    "chhattisgarh": "CG",
    "goa": "GO",
    "gujarat": "GJ",
    "haryana": "HR",
    "himachal pradesh": "HP",
    "jammu and kashmir": "JK",
    "jharkhand": "JH",
    "karnataka": "KA",
    "kerala": "KL",
    "madhya pradesh": "MP",
    "maharashtra": "MH",
    "manipur": "MN",
    "meghalaya": "ME",
    "mizoram": "MZ",
    "nagaland": "NL",
    "odisha": "OD",
    "punjab": "PB",
    "rajasthan": "RJ",
    "sikkim": "SK",
    "tamil nadu": "TN",
    "telangana": "TS",
    "tripura": "TR",
    "uttar pradesh": "UP",
    "uttarakhand": "UK",
    "west bengal": "WB",
    "delhi": "DL"
};

// Commodity mapper for AGMARKNET
const COMMODITY_MAP = {
    "wheat": "1",
    "paddy": "2",
    "mustard": "10",
    "potato": "24",
    "onion": "23",
    "tomato": "25",
    "maize": "4",
    "gram": "12",
    "soyabean": "22"
};

exports.getTodayMandiRates = async (req, res) => {
    try {
        const rates = await MandiRate.find()
            .sort({ rateDate: -1 })
            .limit(10);

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

exports.addMandiRate = async (req, res) => {
    try {
        const rate = await MandiRate.create(req.body);

        res.status(201).json({
            success: true,
            message: "Mandi rate added successfully",
            data: rate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getLiveMandiRates = async (req, res) => {
    const { state, district, commodity } = req.query;

    const stateQuery = state || "Uttar Pradesh";
    const districtQuery = district || "";
    const commodityQuery = commodity || "";

    // Map state and commodity to AGMARKNET codes
    const stateKey = stateQuery.toLowerCase().trim();
    const stateCode = STATE_MAP[stateKey] || "UP";

    const commKey = commodityQuery.toLowerCase().trim();
    const commCode = COMMODITY_MAP[commKey] || "0"; // 0 returns all commodities

    const url = `https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_Commodity=${commCode}&Tx_State=${stateCode}&Tx_District=0`;

    let rates = [];
    let source = "live_scraped";

    try {
        // Set a 4-second timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Parse HTML table rows using Regex
        const rows = [];
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        let match;

        while ((match = rowRegex.exec(html)) !== null) {
            const rowHtml = match[1];
            const cells = [];
            let cellMatch;
            while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
                const text = cellMatch[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, "").trim();
                cells.push(text);
            }
            if (cells.length >= 8) {
                rows.push(cells);
            }
        }

        // Map parsed rows
        const parsedRecords = rows.map(cells => {
            if (cells.length >= 10) {
                return {
                    state: cells[1],
                    district: cells[2],
                    market: cells[3],
                    commodity: cells[4],
                    variety: cells[5],
                    arrival_date: cells[6],
                    min_price: parseFloat(cells[7]) || 0,
                    max_price: parseFloat(cells[8]) || 0,
                    modal_price: parseFloat(cells[9]) || 0
                };
            } else if (cells.length >= 9) {
                return {
                    state: cells[1],
                    district: cells[2],
                    market: cells[3],
                    commodity: cells[4],
                    variety: cells[5],
                    arrival_date: cells[6],
                    min_price: parseFloat(cells[7]) || 0,
                    max_price: parseFloat(cells[8]) || 0,
                    modal_price: parseFloat(cells[8]) || 0
                };
            }
            return null;
        }).filter(Boolean);

        // Filter by district if provided (case-insensitive substring match)
        if (districtQuery) {
            const lowerDistrict = districtQuery.toLowerCase();
            rates = parsedRecords.filter(r => r.district.toLowerCase().includes(lowerDistrict));
        } else {
            rates = parsedRecords;
        }

        // Filter by commodity if provided (case-insensitive substring match)
        if (commodityQuery) {
            const lowerCommodity = commodityQuery.toLowerCase();
            rates = rates.filter(r => r.commodity.toLowerCase().includes(lowerCommodity));
        }

        // Limit results to 20 for performance
        rates = rates.slice(0, 20);

        if (rates.length === 0) {
            throw new Error("No rates found for the query, using fallback");
        }

    } catch (error) {
        console.warn("AGMARKNET scraping failed, using fallback data:", error.message);
        source = "fallback_mock";
        
        // Generate high quality realistic mock rates
        const mockCommodities = ["Wheat", "Paddy", "Mustard", "Potato", "Onion", "Tomato", "Maize"];
        const filteredMockComms = commodityQuery 
            ? mockCommodities.filter(c => c.toLowerCase().includes(commodityQuery.toLowerCase()))
            : mockCommodities;

        const defaultComms = filteredMockComms.length > 0 ? filteredMockComms : [commodityQuery];

        rates = defaultComms.map((comm, index) => {
            const basePrice = comm === "Wheat" ? 2300 : comm === "Mustard" ? 5800 : comm === "Paddy" ? 2100 : comm === "Potato" ? 1500 : comm === "Onion" ? 1800 : comm === "Tomato" ? 2500 : 2000;
            const variance = (index % 3 - 1) * 50; // add some minor price variations
            const modal = basePrice + variance;
            return {
                state: stateQuery,
                district: districtQuery || "Sant Kabir Nagar",
                market: index % 2 === 0 ? "Khalilabad" : "Basti Mandi",
                commodity: comm,
                variety: "Dara / Local",
                arrival_date: new Date().toLocaleDateString("en-GB"),
                min_price: modal - 100,
                max_price: modal + 100,
                modal_price: modal
            };
        });
    }

    try {
        const mongoose = require("mongoose");
        let dbCrops = [];

        if (mongoose.connection.readyState === 1) {
            const searchCommodities = rates.map(r => r.commodity);
            dbCrops = await Crop.find({
                cropName: { $in: searchCommodities.map(c => new RegExp(c, "i")) },
                status: "active"
            }).populate("farmer", "name mobile email");
        }

        // Format and return with mandi rates
        res.json({
            success: true,
            source,
            count: rates.length,
            state: stateQuery,
            district: districtQuery,
            date: new Date().toLocaleDateString("en-GB"),
            data: rates,
            dbCrops: dbCrops.map(c => ({
                id: c._id,
                farmerName: c.farmer ? c.farmer.name : "Kisan Partner",
                mobile: c.farmer ? c.farmer.mobile : "9876543210",
                email: c.farmer ? c.farmer.email : "kisan@gaonbazar.com",
                cropName: c.cropName,
                expectedPrice: c.expectedPrice,
                unit: c.unit,
                quantity: c.quantity,
                location: c.location,
                grade: c.grade
            }))
        });
    } catch (dbError) {
        res.json({
            success: true,
            source,
            count: rates.length,
            state: stateQuery,
            district: districtQuery,
            date: new Date().toLocaleDateString("en-GB"),
            data: rates,
            dbCrops: []
        });
    }
};