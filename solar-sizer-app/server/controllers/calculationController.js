    // These lines assume the 'services' folder exists one level UP from 'controllers'
    const pvgisService = require('../services/pvgisService');
    const sizingService = require('../services/sizingService');
    const pricingService = require('../services/pricingService');

    exports.calculateSystemSize = async (req, res, next) => { // Added next for error handling
      try {
        const userInput = req.body;
        console.log("Received calculation request:", JSON.stringify(userInput)); // Log less verbosely

        // --- Input Validation ---
        if (!userInput || !Array.isArray(userInput.appliances) || !userInput.location || typeof userInput.autonomyHours !== 'number' || userInput.autonomyHours < 0) {
          const error = new Error('Invalid input: Requires appliances array, location {lat, lon}, and autonomyHours number.');
          error.statusCode = 400;
          return next(error); // Pass error to handler
        }
         if (typeof userInput.location.lat !== 'number' || typeof userInput.location.lon !== 'number') {
           const error = new Error('Invalid location: lat and lon must be numbers.');
           error.statusCode = 400;
           return next(error);
         }
         const gridCostPerKwh = userInput.gridCostPerKwh ? parseFloat(userInput.gridCostPerKwh) : undefined;
         if (userInput.gridCostPerKwh && (isNaN(gridCostPerKwh) || gridCostPerKwh < 0)) {
             const error = new Error('Invalid Grid Cost: Must be a non-negative number.');
             error.statusCode = 400;
             return next(error);
         }


        // --- Call Services ---
        // 1. Get PVGIS Data (Can throw error)
        const pvgisData = await pvgisService.getIrradiance({
          latitude: userInput.location.lat,
          longitude: userInput.location.lon,
        });

        // 2. Calculate Energy Needs
        const dailyEnergyKWh = sizingService.calculateDailyEnergy(userInput.appliances);
        const peakLoadW = sizingService.calculatePeakLoad(userInput.appliances);

         if (dailyEnergyKWh <= 0) {
             const error = new Error('Calculation Error: Daily energy usage must be greater than zero. Please check appliance list and usage hours.');
             error.statusCode = 400;
             return next(error);
         }

        // 3. Size System Components
        const systemSize = sizingService.calculateSystemComponents({
          dailyEnergyKWh,
          peakLoadW,
          irradiance: pvgisData.averageDailyIrradiance,
          autonomyHours: userInput.autonomyHours,
          // Add other necessary parameters if sizingService requires them
        });

        // 4. Estimate Costs
        const costEstimate = await pricingService.estimateComponentCosts(systemSize);

        // 5. Calculate ROI
        const roiAnalysis = sizingService.calculateROI({
           totalSolarCost: costEstimate.total,
           dailyEnergyKWh: dailyEnergyKWh,
           currentGridCostPerKwh: gridCostPerKwh // Pass parsed value or undefined (service uses default)
        });

        // --- Send Successful Response ---
        res.json({
          meta: {
             timestamp: new Date().toISOString(),
             pvgisDataSource: pvgisData.source,
             irradianceUsed: pvgisData.averageDailyIrradiance,
          },
          inputsReceived: { // Echo back key inputs used
              location: userInput.location,
              autonomyHours: userInput.autonomyHours,
              ...(gridCostPerKwh && { assumedGridCostPerKwh: gridCostPerKwh }) // Include grid cost if provided
          },
          calculatedNeeds: {
              dailyEnergyKWh: dailyEnergyKWh.toFixed(2),
              peakLoadW: peakLoadW.toFixed(0)
          },
          recommendedSystem: systemSize,
          estimatedCost: costEstimate, // Contains KES formatted values
          roiAnalysis: roiAnalysis, // Contains KES formatted savings
        });

      } catch (error) {
         console.error("Error during calculation:", error);
         // Ensure statusCode is set for client feedback
         if (!error.statusCode) {
            // If PVGIS service threw a specific error message but no code
            if (error.message.includes("PVGIS Error:")) {
                 error.statusCode = 502; // Bad Gateway (issue talking to external service)
            } else {
                 error.statusCode = 500; // Default internal server error
            }
         }
         next(error); // Pass to the central error handler in server.js
      }
    };