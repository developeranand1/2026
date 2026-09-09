const Crop = require("../models/Crop");
const News = require("../models/News");

const SITE_NAME = "KrisiMarg";
const BASE_URL = "https://krisimarg.com";
const DEFAULT_BANNER = "https://krisimarg.com/imgs/banner/banner-all.png";

/**
 * Helper to check if incoming user-agent is a Social Sharing Crawler/Bot (WhatsApp, Facebook, Twitter, Telegram, etc.)
 */
exports.isSocialBot = (userAgent = "") => {
    const bots = [
        "facebookexternalhit",
        "whatsapp",
        "twitterbot",
        "telegrambot",
        "linkedinbot",
        "pinterest",
        "slackbot",
        "discordbot",
        "skypeuripreview",
        "vkshare",
        "bingbot",
        "googlebot"
    ];
    const ua = userAgent.toLowerCase();
    return bots.some(bot => ua.includes(bot));
};

/**
 * Generates an SEO & Social Open Graph (OG) HTML page for Crop/Product listings
 */
exports.getCropOgPreview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userAgent = req.headers["user-agent"] || "";

        // Only intercept social crawler bots, otherwise let normal SPA handle it
        if (!exports.isSocialBot(userAgent) && !req.query.preview) {
            return next();
        }

        const crop = await Crop.findById(id).lean();
        if (!crop) {
            return next();
        }

        const name = crop.cropName || "Crop Produce";
        const loc = crop.location || "India";
        const price = `₹${crop.expectedPrice || 0}/${crop.priceUnit || "Qtl"}`;
        const qty = `${crop.quantity || ""} ${crop.unit || "Qtl"}`;
        const image = (crop.images && crop.images[0]) || crop.image || DEFAULT_BANNER;
        const targetUrl = `${BASE_URL}/product/${crop._id}`;
        const title = `${name} (${qty}) - ${price} | ${SITE_NAME}`;
        const description = `🌾 Buy ${name} directly from ${crop.postedByName || "Farmer"} in ${loc}. Quantity: ${qty}, Offer Rate: ${price}. Verified agricultural listing on KrisiMarg.`;

        const html = `<!doctype html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / WhatsApp / Facebook Preview Card -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:url" content="${targetUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(name)}">
  <meta property="og:locale" content="hi_IN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@KrisiMarg">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">

  <!-- Instant Browser Redirect for Real Users -->
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <script>window.location.href = "${targetUrl}";</script>
</head>
<body>
  <p>Redirecting to <a href="${targetUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

        res.set("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
    } catch (error) {
        return next();
    }
};

/**
 * Generates an SEO & Social Open Graph (OG) HTML page for News Articles
 */
exports.getNewsOgPreview = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const userAgent = req.headers["user-agent"] || "";

        if (!exports.isSocialBot(userAgent) && !req.query.preview) {
            return next();
        }

        const query = slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug };
        const article = await News.findOne(query).lean();
        if (!article) {
            return next();
        }

        const title = article.metaTitle || `${article.title} | ${SITE_NAME}`;
        const description = article.metaDescription || article.shortDescription || article.title;
        const image = article.image || DEFAULT_BANNER;
        const targetUrl = `${BASE_URL}/news/${article.slug || article._id}`;

        const html = `<!doctype html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / WhatsApp / Facebook Preview Card -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:url" content="${targetUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(article.title)}">
  <meta property="og:locale" content="hi_IN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@KrisiMarg">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">

  <!-- Instant Browser Redirect for Real Users -->
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <script>window.location.href = "${targetUrl}";</script>
</head>
<body>
  <p>Redirecting to <a href="${targetUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

        res.set("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
    } catch (error) {
        return next();
    }
};

function escapeHtml(str = "") {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
