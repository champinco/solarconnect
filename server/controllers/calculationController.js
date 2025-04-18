// --- Placeholder Services (Simulating Dev 3, 4, 5 Tasks) ---
const pvgisService = require('../services/pvgisService');
const sizingService = require('../services/sizingService');
const pricingService = require('../services/pricingService');

const sizingService = {
    calculateDailyEnergy: (appliances) => {
        if (!Array.isArray(appliances)) return 0;
        return appliances.reduce((sum, app) => {
            const watts = app.wattage || 0;
            const hours = app.hours || 0;
            const qty = app.quantity || 1;
            return sum + (watts * hours * qty / 1000); // kWh
        }, 0);
    },
    calculatePeakLoad: (appliances) => {
         if (!Array.isArray(appliances)) return 0;
         // Simplistic: Sum of all appliance wattages * quantity.
         // Real-world might need factors for non-simultaneous use.
         return appliances.reduce((sum, app) => sum + (app.wattage * app.quantity), 0);
    },
    calculateSystemComponents: ({ dailyEnergyKWh, peakLoadW, irradiance, autonomyHours, systemLosses = 0.25, batteryDoD = 0.8, panelWattsOption = 550 }) => {
        console.log(`Sizing with: Energy=${dailyEnergyKWh.toFixed(2)}kWh, Peak=${peakLoadW}W, Irradiance=${irradiance}kWh/m2, Autonomy=${autonomyHours}h`);

        // 1. PV Array Size (kWp)
        const requiredEnergyFromPV = dailyEnergyKWh / (1 - systemLosses); // Account for system losses
        const peakSunHoursEquivalent = irradiance; // Simplification: using average daily irradiance directly
        const requiredWp = (requiredEnergyFromPV / peakSunHoursEquivalent) * 1000; // Convert kWh to Wp
        const numberOfPanels = Math.ceil(requiredWp / panelWattsOption);
        const actualPanelWp = numberOfPanels * panelWattsOption;

        // 2. Battery Size (kWh)
        // Energy needed for autonomy period + buffer for DoD
        const nightlyEnergy = dailyEnergyKWh * (autonomyHours / 24); // Rough estimate of energy used during autonomy
        const requiredUsableBatteryKWh = nightlyEnergy; // Assuming autonomy covers non-sun hours mainly
        const totalBatteryKWh = requiredUsableBatteryKWh / batteryDoD; // Account for Depth of Discharge

         // 3. Inverter Size (kW)
         // Max of Peak Load (with surge factor) or PV array size (typical ratio)
         const loadBasedInverterKW = peakLoadW / 1000 * 1.25; // Add 25% buffer for surges/inrush current
         const pvBasedInverterKW = actualPanelWp / 1000 * 1.0; // Often sized close to PV array size for grid-tied/hybrid
         const inverterKW = Math.ceil(Math.max(loadBasedInverterKW, pvBasedInverterKW)); // Take the larger

        return {
            panels: {
                description: `${numberOfPanels} x ${panelWattsOption}W Panels`,
                totalWp: actualPanelWp,
                panelCount: numberOfPanels,
                panelWattage: panelWattsOption
            },
            battery: {
                description: `Approx. ${totalBatteryKWh.toFixed(1)} kWh Total (${(requiredUsableBatteryKWh).toFixed(1)} kWh Usable)`,
                totalKWh: parseFloat(totalBatteryKWh.toFixed(1)),
                usableKWh: parseFloat(requiredUsableBatteryKWh.toFixed(1)),
                autonomyHours: autonomyHours,
                dodUsed: batteryDoD
            },
            inverter: {
                description: `Approx. ${inverterKW} kW Inverter`,
                totalKW: inverterKW
            }
        };
    },
    calculateROI: ({ totalSolarCost, dailyEnergyKWh, currentGridCostPerKwh = 0.25 }) => { // Default KES/kWh assumption if not provided
         // Basic ROI - needs refinement with lifespan, degradation, maintenance costs etc.
         if (!currentGridCostPerKwh || currentGridCostPerKwh <= 0 || totalSolarCost <= 0 || dailyEnergyKWh <=0) {
            return { paybackYears: "N/A", estimatedAnnualSavings: "N/A", warning: "Insufficient data for ROI calculation."};
         }
         const dailyGridCost = dailyEnergyKWh * currentGridCostPerKwh;
         const annualGridSavings = dailyGridCost * 365;
         const paybackYears = totalSolarCost / annualGridSavings;
         return {
            paybackYears: paybackYears.toFixed(1),
            estimatedAnnualSavings: annualGridSavings.toFixed(2),
            assumedGridCostPerKwh: currentGridCostPerKwh
         }
    }
};

const pricingService = {
    estimateComponentCosts: async (systemSize) => {
        console.log("SIMULATING: Component cost estimation");
        // --- Placeholder Cost Data (Simulating Dev 4's Task) ---
        // THESE ARE VERY ROUGH ESTIMATES IN USD - Need real KES data!
        const costPerWp_Panels = 0.40;  // Panel only
        const costPerWp_BoS = 0.30;    // Mounting, wiring, combiner boxes etc.
        const costPerKWh_Battery = 200; // LiFePO4 typically $200-400/kWh
        const costPerKW_Inverter = 120; // Hybrid inverter cost per kW
        const installCostFactor = 0.25; // % of hardware for installation labour
        // --- End Placeholder Cost Data ---

        const panelHardwareCost = systemSize.panels.totalWp * costPerWp_Panels;
        const bosCost = systemSize.panels.totalWp * costPerWp_BoS;
        const batteryCost = systemSize.battery.totalKWh * costPerKWh_Battery;
        const inverterCost = systemSize.inverter.totalKW * costPerKW_Inverter;

        const totalHardwareCost = panelHardwareCost + bosCost + batteryCost + inverterCost;
        const installationCost = totalHardwareCost * installCostFactor;
        const totalSystemCost = totalHardwareCost + installationCost;

        return {
             breakdown: [
                { component: 'PV Panels', description: `${systemSize.panels.panelCount} x ${systemSize.panels.panelWattage}W`, unitCostEst: costPerWp_Panels, totalCost: panelHardwareCost },
                { component: 'Balance of System', description: 'Mounting, Wiring etc.', unitCostEst: costPerWp_BoS, totalCost: bosCost },
                { component: 'Battery Storage', description: `${systemSize.battery.totalKWh.toFixed(1)} kWh Total`, unitCostEst: costPerKWh_Battery, totalCost: batteryCost },
                { component: 'Hybrid Inverter', description: `${systemSize.inverter.totalKW} kW`, unitCostEst: costPerKW_Inverter, totalCost: inverterCost },
                { component: 'Installation Estimate', description: `Approx. ${(installCostFactor * 100).toFixed(0)}% of Hardware`, totalCost: installationCost },
            ],
            total: totalSystemCost,
            currency: "USD (Placeholder Estimate)", // IMPORTANT: Clearly mark as estimate
            notes: "Costs are illustrative placeholders based on global averages, NOT local Kenyan market prices. Use for budget estimation ONLY."
        };
    }
};

// Actual controller function called by the route
exports.calculateSystemSize = async (req, res, next) => {
  try {
    const userInput = req.body;
    console.log("Received calculation request"); // Keep logs concise

    // --- Input Validation ---
    if (!userInput || !Array.isArray(userInput.appliances) || !userInput.location || typeof userInput.autonomyHours !== 'number' || userInput.autonomyHours < 0) {
      const error = new Error('Invalid input: Requires appliances array, location object {lat, lon}, and autonomyHours number.');
      error.statusCode = 400;
      return next(error);
    }

     // Validate Location more thoroughly
     const latNum = userInput.location.lat;
     const lonNum = userInput.location.lon;
     if (typeof latNum !== 'number' || isNaN(latNum) || latNum < -90 || latNum > 90) {
         const error = new Error('Invalid latitude: Must be a number between -90 and 90.');
         error.statusCode = 400;
         return next(error);
     }
      if (typeof lonNum !== 'number' || isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
          const error = new Error('Invalid longitude: Must be a number between -180 and 180.');
          error.statusCode = 400;
          return next(error);
      }

     const gridCostPerKwh = userInput.gridCostPerKwh ? parseFloat(userInput.gridCostPerKwh) : undefined;
     if (userInput.gridCostPerKwh && (isNaN(gridCostPerKwh) || gridCostPerKwh < 0)) {
         const error = new Error('Invalid Grid Cost: Must be a non-negative number.');
         error.statusCode = 400;
         return next(error);
     }

     // Validate Appliances (basic check)
     if (userInput.appliances.some(app => typeof app.wattage !== 'number' || typeof app.hours !== 'number' || typeof app.quantity !== 'number' || app.wattage < 0 || app.hours < 0 || app.quantity <= 0)) {
         const error = new Error('Invalid appliance data: Wattage, hours, and quantity must be valid positive numbers.');
          error.statusCode = 400;
          return next(error);
     }


    // --- Call Services ---
    const pvgisData = await pvgisService.getIrradiance({
      latitude: latNum, // Use validated numbers
      longitude: lonNum,
    });

    const dailyEnergyKWh = sizingService.calculateDailyEnergy(userInput.appliances);
    const peakLoadW = sizingService.calculatePeakLoad(userInput.appliances);

     if (dailyEnergyKWh <= 0 && userInput.appliances.length > 0) {
         const error = new Error('Calculation Error: Daily energy usage is zero or negative. Please check appliance usage hours.');
         error.statusCode = 400;
         return next(error);
     }
      // Allow zero energy if no appliances were added (though UI should prevent this)
      if (dailyEnergyKWh <= 0 && userInput.appliances.length === 0) {
          const error = new Error('Input Error: No appliances selected.');
          error.statusCode = 400;
          return next(error);
      }


    const systemSize = sizingService.calculateSystemComponents({
      dailyEnergyKWh,
      peakLoadW,
      irradiance: pvgisData.averageDailyIrradiance,
      autonomyHours: userInput.autonomyHours,
    });

    const costEstimate = await pricingService.estimateComponentCosts(systemSize);

    const roiAnalysis = sizingService.calculateROI({
       totalSolarCost: costEstimate.total,
       dailyEnergyKWh: dailyEnergyKWh,
       currentGridCostPerKwh: gridCostPerKwh
    });

    // --- Send Successful Response ---
    res.json({
      meta: { timestamp: new Date().toISOString(), pvgisDataSource: pvgisData.source, irradianceUsed: pvgisData.averageDailyIrradiance, },
      inputsReceived: { location: { lat: latNum, lon: lonNum }, autonomyHours: userInput.autonomyHours, ...(gridCostPerKwh && { assumedGridCostPerKwh: gridCostPerKwh }) },
      calculatedNeeds: { dailyEnergyKWh: dailyEnergyKWh.toFixed(2), peakLoadW: peakLoadW.toFixed(0) },
      recommendedSystem: systemSize,
      estimatedCost: costEstimate,
      roiAnalysis: roiAnalysis,
    });

  } catch (error) {
     console.error("Error during calculation:", error);
     if (!error.statusCode) {
        if (error.message.includes("PVGIS Error:")) { error.statusCode = 502; }
        else { error.statusCode = 500; }
     }
     next(error);
  }
}; 