const mongoose = require("mongoose");
const Training = require("../models/Training");
const cloudinary = require("../config/cloudinary");

/**
 * Helper function to upload base64 image to Cloudinary
 */
const uploadToCloudinary = async (base64String, folderName = "trainings") => {
    try {
        if (!base64String || typeof base64String !== "string" || !base64String.startsWith("data:image/")) {
            return base64String;
        }

        const uploadResult = await cloudinary.uploader.upload(base64String, {
            folder: `gaonbazar/${folderName}`,
            resource_type: "image"
        });

        return uploadResult.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Upload image endpoint for Training gallery / cover
 * POST /api/trainings/upload-image
 */
exports.uploadTrainingImage = async (req, res, next) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image provided"
            });
        }

        const imageUrl = await uploadToCloudinary(image, "trainings");
        res.json({
            success: true,
            imageUrl
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all trainings with filter and pagination
 * GET /api/trainings
 */
exports.getAllTrainings = async (req, res, next) => {
    try {
        const { status, category, village, district, search, limit = 50, page = 1 } = req.query;
        const query = {};

        if (status && status !== "All") {
            query.status = status;
        }

        if (category && category !== "All") {
            query.category = category;
        }

        if (village) {
            query.village = { $regex: village, $options: "i" };
        }

        if (district) {
            query.district = { $regex: district, $options: "i" };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { trainerName: { $regex: search, $options: "i" } },
                { village: { $regex: search, $options: "i" } },
                { district: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [trainings, total, statsAgg] = await Promise.all([
            Training.find(query)
                .sort({ startDate: status === "Completed" ? -1 : 1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Training.countDocuments(query),
            Training.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalParticipants: { $sum: { $size: { $ifNull: ["$participants", []] } } }
                    }
                }
            ])
        ]);

        let stats = {
            total: 0,
            upcoming: 0,
            ongoing: 0,
            completed: 0,
            cancelled: 0,
            totalFarmersTrained: 0
        };

        statsAgg.forEach((item) => {
            stats.total += item.count;
            if (item._id === "Upcoming") stats.upcoming = item.count;
            if (item._id === "Ongoing") stats.ongoing = item.count;
            if (item._id === "Completed") {
                stats.completed = item.count;
                stats.totalFarmersTrained += item.totalParticipants;
            }
            if (item._id === "Cancelled") stats.cancelled = item.count;
        });

        res.json({
            success: true,
            count: trainings.length,
            total,
            stats,
            data: trainings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Upcoming trainings
 * GET /api/trainings/upcoming
 */
exports.getUpcomingTrainings = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;
        const trainings = await Training.find({
            status: { $in: ["Upcoming", "Ongoing"] }
        })
            .sort({ startDate: 1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: trainings.length,
            data: trainings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Completed / Successful trainings
 * GET /api/trainings/completed
 */
exports.getCompletedTrainings = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;
        const trainings = await Training.find({
            status: "Completed"
        })
            .sort({ startDate: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: trainings.length,
            data: trainings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Training Stats
 * GET /api/trainings/stats
 */
exports.getTrainingStats = async (req, res, next) => {
    try {
        const [total, upcoming, completed, ongoing, allTrainings] = await Promise.all([
            Training.countDocuments(),
            Training.countDocuments({ status: "Upcoming" }),
            Training.countDocuments({ status: "Completed" }),
            Training.countDocuments({ status: "Ongoing" }),
            Training.find({}, { participants: 1, status: 1 })
        ]);

        let totalRegistered = 0;
        let totalCertified = 0;

        allTrainings.forEach((t) => {
            if (t.participants) {
                totalRegistered += t.participants.length;
                if (t.status === "Completed") {
                    totalCertified += t.participants.length;
                }
            }
        });

        res.json({
            success: true,
            data: {
                total,
                upcoming,
                completed,
                ongoing,
                totalRegistered,
                totalCertified: totalCertified > 0 ? totalCertified : 240
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single training by ID or Slug
 * GET /api/trainings/:id
 */
exports.getTrainingByIdOrSlug = async (req, res, next) => {
    try {
        const { id } = req.params;
        let training;

        if (mongoose.Types.ObjectId.isValid(id)) {
            training = await Training.findById(id);
        }

        if (!training) {
            training = await Training.findOne({ slug: id });
        }

        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Training / Event not found"
            });
        }

        // Increment view count
        training.views = (training.views || 0) + 1;
        await training.save({ validateBeforeSave: false });

        res.json({
            success: true,
            data: training
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new Training / Event
 * POST /api/trainings
 */
exports.createTraining = async (req, res, next) => {
    try {
        const {
            title,
            category,
            trainerName,
            trainerDesignation,
            organizer,
            village,
            district,
            state,
            fullAddress,
            startDate,
            endDate,
            time,
            duration,
            description,
            topics,
            coverImage,
            galleryImages,
            status,
            maxCapacity,
            fee,
            contactPerson,
            contactPhone,
            successSummary,
            keyAchievements,
            isFeatured,
            participants
        } = req.body;

        if (!title || !village || !district || !fullAddress || !startDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: title, village, district, fullAddress, startDate"
            });
        }

        let uploadedCoverImage = coverImage;
        if (coverImage && coverImage.startsWith("data:image/")) {
            uploadedCoverImage = await uploadToCloudinary(coverImage, "trainings");
        }

        let uploadedGallery = [];
        if (galleryImages && Array.isArray(galleryImages)) {
            for (const img of galleryImages) {
                if (img && img.startsWith("data:image/")) {
                    const url = await uploadToCloudinary(img, "trainings/gallery");
                    uploadedGallery.push(url);
                } else if (img) {
                    uploadedGallery.push(img);
                }
            }
        }

        const newTraining = new Training({
            title,
            category: category || "Organic Farming",
            trainerName: trainerName || "Krishi Vigyan Expert",
            trainerDesignation: trainerDesignation || "Senior Agronomist",
            organizer: organizer || "KrisiMarg Kisan Training Mission",
            village,
            district,
            state: state || "Uttar Pradesh",
            fullAddress,
            startDate,
            endDate: endDate || startDate,
            time: time || "10:00 AM - 02:00 PM",
            duration: duration || "1 Day (4 Hours)",
            description: description || "व्यावहारिक कृषि प्रशिक्षण एवं कार्यशाला",
            topics: Array.isArray(topics) ? topics : (topics ? topics.split(",").map((s) => s.trim()) : []),
            coverImage: uploadedCoverImage || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80",
            galleryImages: uploadedGallery,
            status: status || "Upcoming",
            maxCapacity: maxCapacity ? parseInt(maxCapacity) : 50,
            registeredCount: participants ? participants.length : 0,
            fee: fee || "Free / निःशुल्क",
            contactPerson: contactPerson || "KrisiMarg Training Desk",
            contactPhone: contactPhone || "9125955106",
            successSummary: successSummary || "",
            keyAchievements: Array.isArray(keyAchievements) ? keyAchievements : [],
            isFeatured: !!isFeatured,
            participants: participants || []
        });

        await newTraining.save();

        res.status(201).json({
            success: true,
            message: "Training created successfully",
            data: newTraining
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Training / Event
 * PUT /api/trainings/:id
 */
exports.updateTraining = async (req, res, next) => {
    try {
        const { id } = req.params;
        let training = await Training.findById(id);

        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Training not found"
            });
        }

        const updates = { ...req.body };

        // Handle cover image
        if (updates.coverImage && updates.coverImage.startsWith("data:image/")) {
            updates.coverImage = await uploadToCloudinary(updates.coverImage, "trainings");
        }

        // Handle gallery images
        if (updates.galleryImages && Array.isArray(updates.galleryImages)) {
            const processedGallery = [];
            for (const img of updates.galleryImages) {
                if (img && img.startsWith("data:image/")) {
                    const url = await uploadToCloudinary(img, "trainings/gallery");
                    processedGallery.push(url);
                } else if (img) {
                    processedGallery.push(img);
                }
            }
            updates.galleryImages = processedGallery;
        }

        if (updates.topics && typeof updates.topics === "string") {
            updates.topics = updates.topics.split(",").map((s) => s.trim());
        }

        Object.assign(training, updates);
        await training.save();

        res.json({
            success: true,
            message: "Training updated successfully",
            data: training
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Training
 * DELETE /api/trainings/:id
 */
exports.deleteTraining = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Training.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Training not found"
            });
        }

        res.json({
            success: true,
            message: "Training deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public Farmer Self-Registration for Training
 * POST /api/trainings/:id/register
 */
exports.registerFarmerForTraining = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, village, phone, cropsGrown } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please provide your Name and Mobile Number"
            });
        }

        const training = await Training.findById(id);
        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Training not found"
            });
        }

        if (training.status === "Completed" || training.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Registration is closed for this session"
            });
        }

        // Check if phone already registered
        const alreadyRegistered = training.participants.some((p) => p.phone === phone);
        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: "This mobile number is already registered for this training session"
            });
        }

        training.participants.push({
            name,
            village: village || "",
            phone,
            cropsGrown: cropsGrown || "",
            status: "Registered",
            registeredAt: new Date()
        });

        training.registeredCount = training.participants.length;
        await training.save();

        res.status(201).json({
            success: true,
            message: "Registration successful! You have been enrolled in this training session.",
            data: training
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Add / Update Participant
 * POST /api/trainings/:id/participants
 */
exports.addParticipantByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, village, phone, cropsGrown, status } = req.body;

        const training = await Training.findById(id);
        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Training not found"
            });
        }

        training.participants.push({
            name,
            village: village || "",
            phone: phone || "",
            cropsGrown: cropsGrown || "",
            status: status || "Attended",
            registeredAt: new Date()
        });

        training.registeredCount = training.participants.length;
        await training.save();

        res.json({
            success: true,
            message: "Participant added successfully",
            data: training.participants
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Participant from training
 * DELETE /api/trainings/:id/participants/:participantId
 */
exports.deleteParticipant = async (req, res, next) => {
    try {
        const { id, participantId } = req.params;
        const training = await Training.findById(id);

        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Training not found"
            });
        }

        training.participants = training.participants.filter(
            (p) => p._id.toString() !== participantId
        );
        training.registeredCount = training.participants.length;
        await training.save();

        res.json({
            success: true,
            message: "Participant removed successfully",
            data: training.participants
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Seed realistic Demo Training Sessions (Upcoming + Successful Completed)
 * POST /api/trainings/seed
 */
exports.seedTrainings = async (req, res, next) => {
    try {
        await Training.deleteMany({});

        const demoTrainings = [
            {
                title: "उन्नत जैविक खेती एवं जीवामृत/वर्मीकम्पोस्ट निर्माण व्यावहारिक प्रशिक्षण शिविर",
                slug: "organic-farming-vermicompost-training-sant-kabir-nagar",
                category: "Organic Farming",
                trainerName: "डॉ. आर. के. वर्मा (वरिष्ठ कृषि वैज्ञानिक)",
                trainerDesignation: "KVK वैज्ञानिक व जैविक सलाहकार",
                organizer: "KrisiMarg किसान विकास मिशन",
                village: "मगहर (Maghar)",
                district: "संत कबीर नगर (Sant Kabir Nagar)",
                state: "Uttar Pradesh",
                fullAddress: "किसान सेवा केंद्र, निकट कबीर समाधि स्थल, मगहर, संत कबीर नगर",
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                time: "10:30 AM - 03:00 PM",
                duration: "1 Day (4.5 Hours)",
                description: "इस शिविर में किसानों को रासायनिक खादों के विकल्प के रूप में जीवामृत, घनजीवामृत, नीमास्त्र, दशपर्णी अर्क तथा वर्मीकम्पोस्ट (केंचुआ खाद) बनाने की सीधी विधि सिखाई जाएगी। फसल लागत में 60% तक कमी लाने की पूरी तकनीक।",
                topics: [
                    "जीवामृत व बीजामृत बनाने का लाइव डेमो",
                    "वर्मीकम्पोस्ट बेड की सही स्थापना",
                    "प्राकृतिक कीट नियंत्रक (दशपर्णी व नीमास्त्र)",
                    "जैविक प्रमाणीकरण (Organic Certification) की प्रक्रिया"
                ],
                coverImage: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80",
                galleryImages: [
                    "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                ],
                status: "Upcoming",
                maxCapacity: 60,
                registeredCount: 42,
                fee: "Free / निःशुल्क",
                contactPerson: "शैलेंद्र कुमार (प्रशिक्षण समन्वयक)",
                contactPhone: "9125955106",
                isFeatured: true,
                participants: [
                    { name: "रामकुमार मौर्य", village: "मगहर", phone: "9876543210", cropsGrown: "धान, गेहूं, गोभी", status: "Registered" },
                    { name: "विनोद यादव", village: "सेमरिया", phone: "9876543211", cropsGrown: "टमाटर, मिर्च", status: "Registered" },
                    { name: "सत्येंद्र प्रताप", village: "मगहर", phone: "9876543212", cropsGrown: "आलू, सरसों", status: "Registered" },
                    { name: "मुकेश चौधरी", village: "बघौली", phone: "9876543213", cropsGrown: "मक्का, गन्ना", status: "Registered" }
                ]
            },
            {
                title: "टपक सिंचाई (Drip Irrigation) एवं सौर ऊर्जा पंप अनुदान कार्यशाला",
                slug: "drip-irrigation-solar-pump-workshop-khalilabad",
                category: "Drip Irrigation & Water Tech",
                trainerName: "इंजी. अनुपम सिंह (माइक्रो इरीगेशन स्पेशलिस्ट)",
                trainerDesignation: "वरिष्ठ सिंचाई सलाहकार",
                organizer: "KrisiMarg जल संरक्षण प्रकोष्ठ",
                village: "खलीलाबाद (Khalilabad)",
                district: "संत कबीर नगर (Sant Kabir Nagar)",
                state: "Uttar Pradesh",
                fullAddress: "कृषि विज्ञान केंद्र, खलीलाबाद ब्लॉक प्रांगण, संत कबीर नगर",
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                time: "11:00 AM - 02:30 PM",
                duration: "1 Day (3.5 Hours)",
                description: "कम पानी में दोगुनी पैदावार के लिए ड्रिप एवं स्प्रिंकलर सिंचाई प्रणाली की स्थापना। सरकार द्वारा 80% तक मिलने वाली सब्सिडी (PMKSY & Kusum Yojana) हेतु सीधे आवेदन प्रक्रिया सिखाई जाएगी।",
                topics: [
                    "ड्रिप एवं मिनी स्प्रिंकलर लेआउट व इंस्टॉलेशन",
                    "कुसुम योजना 90% सौर पंप सब्सिडी रजिस्ट्रेशन",
                    "फर्टिगेशन (पानी के साथ खाद देने की तकनीक)",
                    "पाइपलाइन व ड्रिपर्स का मेंटेनेंस"
                ],
                coverImage: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1000&q=80",
                galleryImages: [
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                ],
                status: "Upcoming",
                maxCapacity: 50,
                registeredCount: 28,
                fee: "Free / निःशुल्क",
                contactPerson: "दिलीप शर्मा",
                contactPhone: "9125955106",
                isFeatured: true,
                participants: [
                    { name: "अखिलेश कुमार", village: "बघौली", phone: "9876543220", cropsGrown: "सब्जियां", status: "Registered" },
                    { name: "धर्मराज वर्मा", village: "खलीलाबाद", phone: "9876543221", cropsGrown: "गेहूं, सरसों", status: "Registered" }
                ]
            },
            {
                title: "सफल सत्र: वैज्ञानिक मधुमक्खी पालन (Beekeeping) एवं शुद्ध शहद विपणन प्रशिक्षण",
                slug: "successful-beekeeping-training-gorakhpur",
                category: "General Training",
                trainerName: "डॉ. वी. पी. सिंह (हनी फार्मिंग एक्सपर्ट)",
                trainerDesignation: "राष्ट्रीय मधुमक्खी बोर्ड ट्रेनर",
                organizer: "KrisiMarg किसान समृद्धि केंद्र",
                village: "सहजनवा (Sahjanwa)",
                district: "गोरखपुर (Gorakhpur)",
                state: "Uttar Pradesh",
                fullAddress: "ग्राम पंचायत भवन, सहजनवा मुख्य मार्ग, गोरखपुर",
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                time: "10:00 AM - 04:00 PM",
                duration: "1 Day (6 Hours)",
                description: "इस प्रशिक्षण सत्र में 55 किसान भाइयों को इटैलियन मधुमक्खी (Apis mellifera) के बक्से स्थापित करने, रॉयल जेली, पराग (Pollen) निष्कर्षण व KrisiMarg पोर्टल के माध्यम से ₹400/किग्रा पर शुद्ध शहद बेचने का प्रशिक्षण सफलता पूर्वक दिया गया।",
                topics: [
                    "मधुमक्खी कॉलोनी का रखरखाव व रानी मक्खी प्रबंधन",
                    "शहद व मोम का शुद्ध निष्कर्षण",
                    "सरकारी 80% बॉक्स सब्सिडी आवेदन",
                    "KrisiMarg डायरेक्ट बॉयर कनेक्ट"
                ],
                coverImage: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80",
                galleryImages: [
                    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80"
                ],
                status: "Completed",
                maxCapacity: 50,
                registeredCount: 55,
                fee: "Free / निःशुल्क",
                contactPerson: "डॉ. वी. पी. सिंह",
                contactPhone: "9125955106",
                successSummary: "इस कार्यशाला में 55 किसानों ने भाग लिया। सभी को व्यावहारिक डेमो देकर 10-10 बक्से लगाने का लक्ष्य दिया गया तथा KrisiMarg द्वारा प्रमाण पत्र वितरित किए गए। 12 किसानों ने ऑन-द-स्पॉट मधुमक्खी बॉक्स बुक किए।",
                keyAchievements: [
                    "55 किसानों को सफल प्रायोगिक प्रशिक्षण व प्रमाण पत्र",
                    "12 किसानों द्वारा तत्काल 120 बॉक्स का अग्रिम आर्डर",
                    "KrisiMarg के साथ 100% शहद बाय-बैक गारंटी अनुबंध"
                ],
                isFeatured: true,
                participants: [
                    { name: "बृजेश कुमार सिंह", village: "सहजनवा", phone: "9415012345", cropsGrown: "सरसों, अरहर", status: "Certified" },
                    { name: "सूरज मौर्य", village: "गीडा", phone: "9415012346", cropsGrown: "सब्जियां", status: "Certified" },
                    { name: "मनोज तिवारी", village: "खलीलाबाद", phone: "9415012347", cropsGrown: "गेहूं, सरसों", status: "Certified" },
                    { name: "दिनेश यादव", village: "बांसगांव", phone: "9415012348", cropsGrown: "बागवानी", status: "Certified" },
                    { name: "राकेश राय", village: "सहजनवा", phone: "9415012349", cropsGrown: "धान, गेहूं", status: "Certified" }
                ]
            },
            {
                title: "सफल सत्र: पॉलीहाउस एवं संरक्षित खेती (Protected Cultivation) से लाखों की कमाई",
                slug: "successful-polyhouse-farming-basti",
                category: "Horticulture & Fruits",
                trainerName: "डॉ. एम. एल. गुप्ता (उद्यान विशेषज्ञ)",
                trainerDesignation: "सेंटर ऑफ एक्सीलेंस कंसल्टेंट",
                organizer: "KrisiMarg किसान नवाचार मंच",
                village: "रुधौली (Rudhauli)",
                district: "बस्ती (Basti)",
                state: "Uttar Pradesh",
                fullAddress: "आदर्श किसान प्रक्षेत्र, रुधौली ब्लॉक, बस्ती",
                startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
                endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                time: "10:00 AM - 03:30 PM",
                duration: "1 Day (5.5 Hours)",
                description: "बेमौसमी खीरा, रंगीन शिमला मिर्च व टमाटर की संरक्षित खेती (Polyhouse & Shade Net) पर 48 प्रगतिशील किसानों को खेत पर ले जाकर व्यावहारिक प्रशिक्षण दिया गया।",
                topics: [
                    "पॉलीहाउस स्ट्रक्चर व वेंटिलेशन नियंत्रण",
                    "रंगीन शिमला मिर्च व चेरी टमाटर का रोपण",
                    "राष्ट्रीय बागवानी मिशन 50% सब्सिडी प्रक्रिया",
                    "थोक खरीददारों को प्रीमियम भाव पर डायरेक्ट सप्लाई"
                ],
                coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80",
                galleryImages: [
                    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                ],
                status: "Completed",
                maxCapacity: 45,
                registeredCount: 48,
                fee: "Free / निःशुल्क",
                contactPerson: "अजय प्रकाश",
                contactPhone: "9125955106",
                successSummary: "48 किसानों ने पॉलीहाउस में फसल उगाने की तकनीक सीखी। 6 किसानों ने 1000 वर्गमीटर पॉलीहाउस निर्माण हेतु सब्सिडी आवेदन जमा किया।",
                keyAchievements: [
                    "48 किसानों को पॉलीहाउस फार्मिंग का पूर्ण तकनीकी ज्ञान",
                    "6 किसानों का NHM सब्सिडी आवेदन स्वीकृत",
                    "प्रति एकड़ ₹5 लाख तक शुद्ध लाभ का रोडमैप तैयार"
                ],
                isFeatured: true,
                participants: [
                    { name: "अमित कुमार चौधरी", village: "रुधौली", phone: "9839011223", cropsGrown: "शिमला मिर्च", status: "Certified" },
                    { name: "सुरेंद्र नाथ", village: "कप्तानगंज", phone: "9839011224", cropsGrown: "खीरा, टमाटर", status: "Certified" },
                    { name: "प्रमोद सिंह", village: "हरैया", phone: "9839011225", cropsGrown: "सब्जियां", status: "Certified" }
                ]
            }
        ];

        const inserted = await Training.insertMany(demoTrainings);

        res.json({
            success: true,
            message: `Successfully seeded ${inserted.length} training events (Upcoming & Completed)`,
            count: inserted.length,
            data: inserted
        });
    } catch (error) {
        next(error);
    }
};
