const News = require("../models/News");
const Crop = require("../models/Crop");

/**
 * Dynamically generates a complete XML sitemap combining static routes,
 * live published news articles (with slugs), and approved crop produce listings (with IDs).
 */
exports.getDynamicSitemap = async (req, res) => {
    try {
        const baseUrl = "https://krisimarg.com";
        const today = new Date().toISOString().split("T")[0];

        // Fetch published news articles
        const newsArticles = await News.find({ status: "Published" })
            .select("slug updatedAt publishedAt")
            .sort({ publishedAt: -1 })
            .lean();

        // Fetch active & approved crop produce marketplace listings
        const approvedCrops = await Crop.find({ status: "active", approvalStatus: "approved" })
            .select("_id updatedAt createdAt")
            .sort({ createdAt: -1 })
            .lean();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // 1. Core pages
        const corePages = [
            { path: "", priority: "1.0", freq: "daily" },
            { path: "mandi-rates", priority: "0.95", freq: "hourly" },
            { path: "weather", priority: "0.90", freq: "hourly" },
            { path: "news", priority: "0.85", freq: "daily" },
            { path: "about", priority: "0.75", freq: "monthly" },
            { path: "team", priority: "0.70", freq: "monthly" },
            { path: "contact", priority: "0.70", freq: "monthly" },
            { path: "faq", priority: "0.65", freq: "monthly" },
            { path: "login", priority: "0.60", freq: "monthly" },
            { path: "privacy-policy", priority: "0.50", freq: "monthly" },
            { path: "terms", priority: "0.50", freq: "monthly" },
            { path: "refund-policy", priority: "0.50", freq: "monthly" },
            { path: "disclaimer", priority: "0.50", freq: "monthly" }
        ];

        corePages.forEach((p) => {
            const loc = p.path ? `${baseUrl}/${p.path}` : `${baseUrl}/`;
            xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
        });

        // 2. Dynamic News Articles
        newsArticles.forEach((article) => {
            if (article.slug || article._id) {
                const articleUrl = `${baseUrl}/news/${article.slug || article._id}`;
                const lastMod = article.updatedAt ? new Date(article.updatedAt).toISOString().split("T")[0] : today;
                xml += `  <url>\n    <loc>${articleUrl}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.80</priority>\n  </url>\n`;
            }
        });

        // 3. Dynamic Crop Produce Marketplace Listings
        approvedCrops.forEach((crop) => {
            if (crop._id) {
                const cropUrl = `${baseUrl}/product/${crop._id}`;
                const lastMod = crop.updatedAt ? new Date(crop.updatedAt).toISOString().split("T")[0] : today;
                xml += `  <url>\n    <loc>${cropUrl}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
            }
        });

        xml += `</urlset>`;

        res.set("Content-Type", "application/xml; charset=utf-8");
        return res.status(200).send(xml);
    } catch (error) {
        console.error("Sitemap Generation Error:", error);
        return res.status(500).send("Error generating sitemap");
    }
};
