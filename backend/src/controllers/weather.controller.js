const https = require("https");

// Mapping of major Indian State & City default coordinates
const CITY_COORDINATES = {
    "delhi": { lat: 28.6139, lon: 77.2090, state: "Delhi" },
    "lucknow": { lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
    "gorakhpur": { lat: 26.7606, lon: 83.3732, state: "Uttar Pradesh" },
    "khalilabad": { lat: 26.7828, lon: 83.0700, state: "Uttar Pradesh" },
    "sant kabir nagar": { lat: 26.7828, lon: 83.0700, state: "Uttar Pradesh" },
    "gautam buddha nagar": { lat: 28.5355, lon: 77.3910, state: "Uttar Pradesh" },
    "noida": { lat: 28.5355, lon: 77.3910, state: "Uttar Pradesh" },
    "greater noida": { lat: 28.4744, lon: 77.5040, state: "Uttar Pradesh" },
    "ghaziabad": { lat: 28.6692, lon: 77.4538, state: "Uttar Pradesh" },
    "kanpur": { lat: 26.4499, lon: 80.3319, state: "Uttar Pradesh" },
    "varanasi": { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
    "agra": { lat: 27.1767, lon: 78.0081, state: "Uttar Pradesh" },
    "prayagraj": { lat: 25.4358, lon: 81.8463, state: "Uttar Pradesh" },
    "allahabad": { lat: 25.4358, lon: 81.8463, state: "Uttar Pradesh" },
    "meerut": { lat: 28.9845, lon: 77.7064, state: "Uttar Pradesh" },
    "bareilly": { lat: 28.3670, lon: 79.4304, state: "Uttar Pradesh" },
    "aligarh": { lat: 27.8974, lon: 78.0880, state: "Uttar Pradesh" },
    "moradabad": { lat: 28.8386, lon: 78.7733, state: "Uttar Pradesh" },
    "saharanpur": { lat: 29.9671, lon: 77.5452, state: "Uttar Pradesh" },
    "basti": { lat: 26.8140, lon: 82.7630, state: "Uttar Pradesh" },
    "ayodhya": { lat: 26.7922, lon: 82.1998, state: "Uttar Pradesh" },
    "patna": { lat: 25.5941, lon: 85.1376, state: "Bihar" },
    "muzaffarpur": { lat: 26.1209, lon: 85.3647, state: "Bihar" },
    "bhagalpur": { lat: 25.2425, lon: 86.9842, state: "Bihar" },
    "gaya": { lat: 24.7914, lon: 85.0002, state: "Bihar" },
    "purnia": { lat: 25.7771, lon: 87.4753, state: "Bihar" },
    "darbhanga": { lat: 26.1542, lon: 85.8918, state: "Bihar" },
    "samastipur": { lat: 25.8628, lon: 85.7811, state: "Bihar" },
    "ludhiana": { lat: 30.9010, lon: 75.8573, state: "Punjab" },
    "amritsar": { lat: 31.6340, lon: 74.8723, state: "Punjab" },
    "jalandhar": { lat: 31.3260, lon: 75.5762, state: "Punjab" },
    "karnal": { lat: 29.6857, lon: 76.9905, state: "Haryana" },
    "panipat": { lat: 29.3909, lon: 76.9635, state: "Haryana" },
    "gurugram": { lat: 28.4595, lon: 77.0266, state: "Haryana" },
    "indore": { lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
    "bhopal": { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
    "ujjain": { lat: 23.1765, lon: 75.7885, state: "Madhya Pradesh" },
    "jaipur": { lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
    "kota": { lat: 25.2138, lon: 75.8648, state: "Rajasthan" },
    "jodhpur": { lat: 26.2389, lon: 73.0243, state: "Rajasthan" },
    "mumbai": { lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
    "pune": { lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
    "nashik": { lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
    "nagpur": { lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
    "ahmedabad": { lat: 23.0225, lon: 72.5714, state: "Gujarat" },
    "surat": { lat: 21.1702, lon: 72.8311, state: "Gujarat" },
    "rajkot": { lat: 22.3039, lon: 70.8022, state: "Gujarat" },
    "kolkata": { lat: 22.5726, lon: 88.3639, state: "West Bengal" },
    "bengaluru": { lat: 12.9716, lon: 77.5946, state: "Karnataka" },
    "hyderabad": { lat: 17.3850, lon: 78.4867, state: "Telangana" },
    "chennai": { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
    "shimla": { lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },
    "dehradun": { lat: 30.3165, lon: 78.0322, state: "Uttarakhand" },
    "srinagar": { lat: 34.0837, lon: 74.7973, state: "Jammu and Kashmir" }
};

// WMO Weather Code Translator
function decodeWmoCode(code) {
    const table = {
        0: { desc: "Clear Sky (साफ मौसम)", icon: "bi-sun-fill", type: "clear", isRain: false },
        1: { desc: "Mainly Clear (मुख्यतः साफ)", icon: "bi-sun", type: "clear", isRain: false },
        2: { desc: "Partly Cloudy (हल्के बादल)", icon: "bi-cloud-sun-fill", type: "cloudy", isRain: false },
        3: { desc: "Overcast (घने बादल)", icon: "bi-clouds-fill", type: "cloudy", isRain: false },
        45: { desc: "Foggy (कोहरा)", icon: "bi-cloud-fog2-fill", type: "fog", isRain: false },
        48: { desc: "Depositing Rime Fog (घना कोहरा)", icon: "bi-cloud-fog-fill", type: "fog", isRain: false },
        51: { desc: "Light Drizzle (हल्की बूंदाबांदी)", icon: "bi-cloud-drizzle-fill", type: "rain", isRain: true },
        53: { desc: "Moderate Drizzle (बूंदाबांदी)", icon: "bi-cloud-drizzle-fill", type: "rain", isRain: true },
        55: { desc: "Dense Drizzle (तेज़ बूंदाबांदी)", icon: "bi-cloud-drizzle-fill", type: "rain", isRain: true },
        61: { desc: "Slight Rain (हल्की बारिश)", icon: "bi-cloud-rain-fill", type: "rain", isRain: true },
        63: { desc: "Moderate Rain (मध्यम बारिश)", icon: "bi-cloud-rain-heavy-fill", type: "rain", isRain: true },
        65: { desc: "Heavy Rain (तेज़ बारिश)", icon: "bi-cloud-rain-heavy-fill", type: "rain", isRain: true },
        71: { desc: "Slight Snow (हल्की बर्फबारी)", icon: "bi-snow", type: "snow", isRain: true },
        80: { desc: "Rain Showers (बारिश की फुहारें)", icon: "bi-cloud-rain-fill", type: "rain", isRain: true },
        81: { desc: "Heavy Rain Showers (भारी फुहारें)", icon: "bi-cloud-rain-heavy-fill", type: "rain", isRain: true },
        95: { desc: "Thunderstorm (आंधी-तूफान व गर्जन)", icon: "bi-cloud-lightning-rain-fill", type: "storm", isRain: true },
        96: { desc: "Thunderstorm with Hail (ओलावृष्टि)", icon: "bi-cloud-hail-fill", type: "storm", isRain: true }
    };
    return table[code] || { desc: "Partly Cloudy (बादल)", icon: "bi-cloud-sun", type: "cloudy", isRain: false };
}

// Dynamic Geocoder resolver for ANY Indian location
async function resolveCoordinates(cityName, stateName) {
    if (!cityName) return { lat: 26.7606, lon: 83.3732, state: stateName || "Uttar Pradesh" };

    const raw = cityName.toLowerCase();
    const clean = raw.replace(/\([^)]*\)/g, "").replace(/district/gi, "").trim();

    // 1. Check exact match
    if (CITY_COORDINATES[clean]) return CITY_COORDINATES[clean];

    // 2. Check partial matches
    for (const [key, val] of Object.entries(CITY_COORDINATES)) {
        if (clean.includes(key) || key.includes(clean) || raw.includes(key)) {
            return val;
        }
    }

    // 3. Query Open-Meteo Geocoding API dynamically
    try {
        const queryTerm = encodeURIComponent(`${clean} ${stateName || ""}`.trim());
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${queryTerm}&count=1&country=India`;
        
        const geoData = await new Promise((resolve) => {
            https.get(geoUrl, { timeout: 4000 }, (res) => {
                let body = "";
                res.on("data", c => body += c);
                res.on("end", () => {
                    try { resolve(JSON.parse(body)); } catch (e) { resolve(null); }
                });
            }).on("error", () => resolve(null));
        });

        if (geoData && Array.isArray(geoData.results) && geoData.results.length > 0) {
            const result = geoData.results[0];
            return {
                lat: result.latitude,
                lon: result.longitude,
                state: result.admin1 || stateName || "India"
            };
        }
    } catch (err) {
        console.warn("Dynamic geocoding skipped:", err.message);
    }

    // Default fallback
    return { lat: 26.7606, lon: 83.3732, state: stateName || "Uttar Pradesh" };
}

/**
 * Controller to fetch live weather & rain timing from Open-Meteo Meteorological API
 */
exports.getLiveWeather = async (req, res) => {
    try {
        let { lat, lon, city, state } = req.query;

        let cityName = (city || "Gorakhpur").trim();
        let stateName = (state || "Uttar Pradesh").trim();

        // Resolve coordinates if not provided
        if (!lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
            const coord = await resolveCoordinates(cityName, stateName);
            lat = coord.lat;
            lon = coord.lon;
            if (coord.state && !state) stateName = coord.state;
        }

        lat = parseFloat(lat);
        lon = parseFloat(lon);

        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&forecast_days=8`;

        https.get(openMeteoUrl, { timeout: 8000 }, (apiRes) => {
            let data = "";
            apiRes.on("data", chunk => data += chunk);
            apiRes.on("end", () => {
                try {
                    const raw = JSON.parse(data);
                    if (!raw || !raw.current || !raw.hourly) {
                        throw new Error("Invalid weather payload received");
                    }

                    const current = raw.current;
                    const hourly = raw.hourly;
                    const daily = raw.daily;

                    const currentWeatherMeta = decodeWmoCode(current.weather_code);

                    // 1. Process 24-Hour Timeline & Next Rain Timing
                    const currentHourIndex = hourly.time.findIndex(t => new Date(t).getTime() >= (Date.now() - 3600000));
                    const startIdx = Math.max(0, currentHourIndex);
                    const next24Hours = [];
                    let nextRainInfo = null;

                    for (let i = startIdx; i < Math.min(hourly.time.length, startIdx + 24); i++) {
                        const timeStr = hourly.time[i];
                        const dateObj = new Date(timeStr);
                        const hourLabel = dateObj.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
                        const prob = hourly.precipitation_probability ? hourly.precipitation_probability[i] || 0 : 0;
                        const rainVol = hourly.precipitation ? hourly.precipitation[i] || 0 : 0;
                        const wCode = hourly.weather_code[i];
                        const wMeta = decodeWmoCode(wCode);
                        const temp = Math.round(hourly.temperature_2m[i]);

                        const item = {
                            time: timeStr,
                            hourLabel: i === startIdx ? "Now" : hourLabel,
                            temp,
                            feelsLike: Math.round(hourly.apparent_temperature[i]),
                            humidity: hourly.relative_humidity_2m[i],
                            rainProb: prob,
                            rainVol: rainVol,
                            windSpeed: Math.round(hourly.wind_speed_10m[i]),
                            uvIndex: hourly.uv_index ? hourly.uv_index[i] : 0,
                            condition: wMeta.desc,
                            icon: wMeta.icon,
                            isRain: prob >= 30 || rainVol > 0
                        };

                        next24Hours.push(item);

                        // Earliest upcoming rain event
                        if (!nextRainInfo && prob >= 35 && i > startIdx) {
                            nextRainInfo = {
                                time: hourLabel,
                                probability: prob,
                                rainVolume: rainVol,
                                condition: wMeta.desc,
                                hoursFromNow: i - startIdx
                            };
                        }
                    }

                    // 2. Process 7-Day Extended Daily Forecast
                    const next7Days = [];
                    if (daily && daily.time) {
                        for (let d = 0; d < Math.min(daily.time.length, 7); d++) {
                            const dTime = daily.time[d];
                            const dDate = new Date(dTime);
                            const dayName = d === 0 ? "Today" : d === 1 ? "Tomorrow" : dDate.toLocaleDateString("en-IN", { weekday: "short" });
                            const dMeta = decodeWmoCode(daily.weather_code[d]);

                            next7Days.push({
                                date: dTime,
                                dayLabel: dayName,
                                dateFormatted: dDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                                maxTemp: Math.round(daily.temperature_2m_max[d]),
                                minTemp: Math.round(daily.temperature_2m_min[d]),
                                rainProbMax: daily.precipitation_probability_max ? daily.precipitation_probability_max[d] || 0 : 0,
                                rainSum: daily.precipitation_sum ? daily.precipitation_sum[d] || 0 : 0,
                                condition: dMeta.desc,
                                icon: dMeta.icon,
                                sunrise: daily.sunrise ? new Date(daily.sunrise[d]).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "",
                                sunset: daily.sunset ? new Date(daily.sunset[d]).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "",
                                uvMax: daily.uv_index_max ? daily.uv_index_max[d] : 0,
                                windMax: Math.round(daily.wind_speed_10m_max[d])
                            });
                        }
                    }

                    // 3. Smart Agricultural Advisories for Farmers (कृषि मौसम सलाह)
                    const maxRainToday = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] || 0 : 0;
                    const windToday = Math.round(current.wind_speed_10m);
                    const tempCurrent = Math.round(current.temperature_2m);

                    const advisories = [];

                    // Irrigation Advisory
                    if (maxRainToday >= 60) {
                        advisories.push({
                            title: "Irrigation Advisory (सिंचाई सलाह)",
                            type: "warning",
                            icon: "bi-droplet-half",
                            advice: "High probability of rain expected. Postpone irrigation in standing crops to prevent waterlogging and root rot."
                        });
                    } else if (maxRainToday < 20 && tempCurrent > 30) {
                        advisories.push({
                            title: "Irrigation Advisory (सिंचाई सलाह)",
                            type: "info",
                            icon: "bi-droplet-fill",
                            advice: "Dry weather with clear skies. Provide light irrigation in the evening or early morning to maintain root moisture."
                        });
                    } else {
                        advisories.push({
                            title: "Irrigation Advisory (सिंचाई सलाह)",
                            type: "success",
                            icon: "bi-check-circle-fill",
                            advice: "Soil moisture is balanced. Irrigate only based on field requirement."
                        });
                    }

                    // Pesticide & Spraying Advisory
                    if (windToday > 20) {
                        advisories.push({
                            title: "Spray Advisory (कीटनाशक छिड़काव)",
                            type: "danger",
                            icon: "bi-wind",
                            advice: "High wind speed detected. Avoid chemical spray and foliar fertilizers as high winds cause spray drift."
                        });
                    } else if (maxRainToday >= 50) {
                        advisories.push({
                            title: "Spray Advisory (कीटनाशक छिड़काव)",
                            type: "warning",
                            icon: "bi-cloud-rain",
                            advice: "Rain expected. Do not spray pesticides as rainfall will wash away chemicals."
                        });
                    } else {
                        advisories.push({
                            title: "Spray Advisory (कीटनाशक छिड़काव)",
                            type: "success",
                            icon: "bi-shield-check",
                            advice: "Optimal calm weather conditions for insecticide, weedicide, and micronutrient spray."
                        });
                    }

                    // Harvesting & Storage Advisory
                    if (maxRainToday >= 40) {
                        advisories.push({
                            title: "Harvest & Storage (कटाई व भंडारण)",
                            type: "warning",
                            icon: "bi-box-seam",
                            advice: "Keep harvested grains and vegetables covered under tarpaulins in safe elevated sheds."
                        });
                    } else {
                        advisories.push({
                            title: "Harvest & Storage (कटाई व भंडारण)",
                            type: "success",
                            icon: "bi-sun",
                            advice: "Good sunshine available. Ideal time for sun-drying harvested grains and pulse crops."
                        });
                    }

                    return res.json({
                        success: true,
                        source: "IMD & Open-Meteo High-Resolution Agricultural Weather Model",
                        location: {
                            city: cityName,
                            state: stateName,
                            latitude: lat,
                            longitude: lon,
                            elevation: raw.elevation || 100,
                            timezone: raw.timezone || "Asia/Kolkata"
                        },
                        current: {
                            temperature: Math.round(current.temperature_2m),
                            feelsLike: Math.round(current.apparent_temperature),
                            humidity: current.relative_humidity_2m,
                            condition: currentWeatherMeta.desc,
                            icon: currentWeatherMeta.icon,
                            isRain: currentWeatherMeta.isRain,
                            precipitation: current.precipitation,
                            windSpeed: Math.round(current.wind_speed_10m),
                            windDirection: current.wind_direction_10m,
                            pressure: Math.round(current.surface_pressure),
                            cloudCover: current.cloud_cover,
                            time: current.time
                        },
                        rainAlert: nextRainInfo ? {
                            hasRain: true,
                            message: `Rain expected around ${nextRainInfo.time} (${nextRainInfo.probability}% chance, ${nextRainInfo.condition})`,
                            timing: nextRainInfo.time,
                            probability: nextRainInfo.probability
                        } : {
                            hasRain: false,
                            message: "No significant rainfall expected in the next 24 hours.",
                            timing: "Dry & Clear",
                            probability: 0
                        },
                        hourlyForecast: next24Hours,
                        dailyForecast: next7Days,
                        advisories: advisories,
                        updatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
                    });

                } catch (parseErr) {
                    console.error("Open-Meteo parse error:", parseErr);
                    return res.status(500).json({ success: false, message: "Error parsing weather feed" });
                }
            });
        }).on("error", (err) => {
            console.error("Open-Meteo connection error:", err);
            return res.status(500).json({ success: false, message: "Failed to connect to meteorological server" });
        });

    } catch (error) {
        console.error("Weather Controller error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
