const axios = require('axios');

// Base URL for PVGIS TMY (Typical Meteorological Year) data
const PVGIS_URL = 'https://re.jrc.ec.europa.eu/api/v5_2/tmy';

const getIrradiance = async ({ latitude, longitude }) => {
    console.log(`PVGIS Service: Fetching TMY for Lat: ${latitude}, Lon: ${longitude}`);

    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        throw new Error("Invalid latitude or longitude provided for PVGIS.");
    }

    try {
        const response = await axios.get(PVGIS_URL, {
            params: {
                lat: latitude,
                lon: longitude,
                outputformat: 'json',
                usehorizon: 1, // Use calculated horizon
                userhorizon: '', // Empty if usehorizon=1
                startyear: 2005, // Or specify a range if needed
                endyear: 2020,   // Use recent available years
                browser: 0 // Indicate non-browser request
            },
            timeout: 10000 // 10 second timeout for the request
        });

        if (response.data && response.data.outputs && response.data.outputs.tmy_avg_dni) {
             // PVGIS provides various outputs. We need Global Horizontal Irradiation (GHI)
             // A robust implementation parses 'outputs.tmy_monthly' array for 'GHI'

             let avgGHI_Whm2day = 5500; // Default fallback reasonable for Kenya
             try {
                // Attempt to find and average GHI from monthly data
                const monthlyData = response.data.outputs.tmy_monthly;
                const ghiData = monthlyData.find(item => item.variable === 'GHI'); // GHI = Global horizontal irradiation
                if (ghiData && ghiData.value && ghiData.value.length === 12) {
                    const sum = ghiData.value.reduce((a, b) => a + b, 0);
                    avgGHI_Whm2day = sum / 12; // Average Wh/m²/day
                    console.log(`PVGIS Service: Calculated average GHI: ${avgGHI_Whm2day.toFixed(0)} Wh/m2/day`);
                } else {
                    console.warn("PVGIS Service: Could not find or average monthly GHI data, using default.");
                }
             } catch (parseError) {
                console.error("PVGIS Service: Error parsing monthly GHI data:", parseError);
             }


            const averageDailyIrradianceKWhm2 = avgGHI_Whm2day / 1000; // Convert Wh to kWh

            console.log(`PVGIS Service: Successfully fetched data. Avg Daily Irradiance: ${averageDailyIrradianceKWhm2.toFixed(2)} kWh/m²/day`);
            return {
                averageDailyIrradiance: parseFloat(averageDailyIrradianceKWhm2.toFixed(2)),
                source: "PVGIS API v5.2 (TMY)"
            };
        } else {
            console.error("PVGIS Service: Invalid response structure received:", response.data);
            throw new Error("PVGIS API returned unexpected data format.");
        }

    } catch (error) {
        console.error(`PVGIS Service Error: Failed to fetch data for ${latitude}, ${longitude}. Status: ${error.response?.status}`, error.message);
        // Provide a more specific error message based on the response
        if (error.response && error.response.status === 400) {
             throw new Error(`PVGIS Error: Invalid location or parameters (Lat: ${latitude}, Lon: ${longitude}). ${error.response.data?.message || ''}`);
        } else if (error.code === 'ECONNABORTED') {
             throw new Error("PVGIS Error: Request timed out. Please try again.");
        }
         // Generic fallback error for other issues
        throw new Error("Failed to fetch solar irradiance data from PVGIS. Please check location and try again.");
    }
};

module.exports = { getIrradiance }; 