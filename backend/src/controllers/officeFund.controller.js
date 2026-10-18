const OfficeFund = require("../models/OfficeFund");
const Staff = require("../models/Staff");

/**
 * Get Treasury / Office Fund Overview & Balances
 */
exports.getFundOverview = async (req, res) => {
    try {
        const transactions = await OfficeFund.find().sort({ date: -1 });

        let totalInflow = 0;
        let totalOutflow = 0;
        let totalInvestments = 0;
        let totalFieldExpensesDisbursed = 0;
        let totalSalariesPaid = 0;
        let totalOfficeExpenses = 0;

        const investorMap = {};

        transactions.forEach((tx) => {
            if (tx.direction === "INFLOW") {
                totalInflow += tx.amount;
                if (tx.type === "INVESTMENT_IN") {
                    totalInvestments += tx.amount;
                    const invName = tx.investorDetails?.name || "Direct Capital / Founder";
                    if (!investorMap[invName]) {
                        investorMap[invName] = {
                            name: invName,
                            organization: tx.investorDetails?.organization || "",
                            mobile: tx.investorDetails?.mobile || "",
                            totalInvested: 0,
                            count: 0
                        };
                    }
                    investorMap[invName].totalInvested += tx.amount;
                    investorMap[invName].count += 1;
                }
            } else if (tx.direction === "OUTFLOW") {
                totalOutflow += tx.amount;
                if (tx.type === "FIELD_DISBURSEMENT") totalFieldExpensesDisbursed += tx.amount;
                else if (tx.type === "SALARY_PAYOUT") totalSalariesPaid += tx.amount;
                else if (tx.type === "OFFICE_EXPENSE") totalOfficeExpenses += tx.amount;
            }
        });

        const currentBalance = totalInflow - totalOutflow;

        res.json({
            success: true,
            data: {
                currentBalance,
                totalInflow,
                totalOutflow,
                totalInvestments,
                totalFieldExpensesDisbursed,
                totalSalariesPaid,
                totalOfficeExpenses,
                investorsSummary: Object.values(investorMap),
                recentTransactionsCount: transactions.length
            }
        });
    } catch (error) {
        console.error("Fund Overview Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all fund transactions with filters
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { direction, type, startDate, endDate, limit = 100 } = req.query;
        const query = {};

        if (direction) query.direction = direction;
        if (type) query.type = type;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await OfficeFund.find(query)
            .populate("recipientStaff", "name mobile designation department")
            .populate("recordedBy", "name role")
            .sort({ date: -1 })
            .limit(Number(limit));

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Record a new fund transaction (Investor capital in, office expense, or disbursement)
 */
exports.recordTransaction = async (req, res) => {
    try {
        const {
            title,
            type,
            direction,
            amount,
            investorDetails,
            recipientStaff,
            paymentMode,
            transactionReference,
            date,
            notes,
            receiptUrl
        } = req.body;

        if (!title || !type || !amount) {
            return res.status(400).json({
                success: false,
                message: "Title, type, and amount are required"
            });
        }

        // Auto-assign direction if not explicitly given
        let finalDirection = direction;
        if (!finalDirection) {
            if (type === "INVESTMENT_IN" || type === "REVENUE_IN") {
                finalDirection = "INFLOW";
            } else {
                finalDirection = "OUTFLOW";
            }
        }

        const transaction = await OfficeFund.create({
            title,
            type,
            direction: finalDirection,
            amount: Number(amount),
            investorDetails: investorDetails || {},
            recipientStaff: recipientStaff || null,
            paymentMode: paymentMode || "BANK_TRANSFER",
            transactionReference: transactionReference || "",
            date: date ? new Date(date) : new Date(),
            notes: notes || "",
            receiptUrl: receiptUrl || "",
            recordedBy: req.staff ? req.staff._id : null
        });

        res.status(201).json({
            success: true,
            message: "Fund transaction recorded successfully",
            data: transaction
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Seed initial fund data if database is empty for testing
 */
exports.seedInitialFunds = async (req, res) => {
    try {
        const count = await OfficeFund.countDocuments();
        if (count > 0) {
            return res.json({ success: true, message: `OfficeFund already has ${count} records.`, count });
        }

        const initialEntries = [
            {
                title: "Seed Investment - AgriVenture Angels Fund",
                type: "INVESTMENT_IN",
                direction: "INFLOW",
                amount: 500000,
                investorDetails: {
                    name: "Rajesh Aggarwal",
                    organization: "AgriVenture Capital",
                    mobile: "9811223344",
                    email: "rajesh@agriventure.in",
                    equityPercentage: 5
                },
                paymentMode: "NEFT_RTGS",
                transactionReference: "UTR-AGRI-500K-981",
                notes: "Tranche 1 capital for field operations and Mandi technology rollout",
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                title: "Founder Capital Infusion",
                type: "INVESTMENT_IN",
                direction: "INFLOW",
                amount: 250000,
                investorDetails: {
                    name: "Anand Sharma (Founder)",
                    organization: "KrisiMarg Founders Desk",
                    mobile: "9999999999",
                    email: "ceo@krisimarg.com"
                },
                paymentMode: "BANK_TRANSFER",
                transactionReference: "FOUNDER-CAP-250K",
                notes: "Working capital for field team allowances & centers",
                date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
            },
            {
                title: "Office Rent & High-Speed Mandi Terminal Internet",
                type: "OFFICE_EXPENSE",
                direction: "OUTFLOW",
                amount: 28000,
                paymentMode: "BANK_TRANSFER",
                transactionReference: "RENT-OCT-2026",
                notes: "Monthly office space & fiber optic lease",
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                title: "Field Sourcing Team Petrol & DA Advance",
                type: "FIELD_DISBURSEMENT",
                direction: "OUTFLOW",
                amount: 15000,
                paymentMode: "UPI",
                transactionReference: "UPI-FIELD-OCT-01",
                notes: "Advance allowance for Sant Kabir Nagar and Gorakhpur survey teams",
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
            }
        ];

        for (const item of initialEntries) {
            await OfficeFund.create(item);
        }

        res.json({
            success: true,
            message: "Seeded initial office fund and investor capital data",
            count: initialEntries.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
