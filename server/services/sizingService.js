// --- Helper function to suggest standard inverter sizes ---
function getStandardInverterSize(calculatedKW) {
    // Common residential sizes (can be expanded)
    const standardSizes = [3, 5, 8, 10, 12, 15];
    // Find the smallest standard size that is >= calculated size
    const suggestedSize = standardSizes.find(size => size >= calculatedKW);
    // If calculated is larger than largest standard, just use calculated (or handle differently)
    return suggestedSize || Math.ceil(calculatedKW);
}


const calculateDailyEnergy = (appliances) => {
    // Calculates total daily energy consumption in kWh from a list of appliances.
    if (!Array.isArray(appliances)) return 0;
    return appliances.reduce((sum, app) => {
        const watts = app.wattage || 0;
        const hours = app.hours || 0;
        const qty = app.quantity || 1;
        return sum + (watts * hours * qty / 1000); // Convert Wh to kWh
    }, 0);
};

const calculatePeakLoad = (appliances) => {
     // Estimates the maximum simultaneous power draw in Watts.
     // Simplistic approach: Sums the wattage of all appliances.
     // Assumes all appliances could potentially run at the same time.
     // A more advanced calculation might use load factors.
     if (!Array.isArray(appliances)) return 0;
     return appliances.reduce((sum, app) => sum + ((app.wattage || 0) * (app.quantity || 1)), 0);
};

const calculateSystemComponents = ({ dailyEnergyKWh, peakLoadW, irradiance, autonomyHours, systemLosses = 0.25, batteryDoD = 0.80, panelWattsOption = 550 }) => {
    console.log(`Sizing with: Energy=${dailyEnergyKWh.toFixed(2)}kWh, Peak=${peakLoadW}W, Irradiance=${irradiance}kWh/m2/day, Autonomy=${autonomyHours}h`);

    if (irradiance <= 0) {
        console.warn("Sizing Warning: Irradiance is zero or negative. Using fallback 4.5 kWh/m2/day.");
        irradiance = 4.5; // Fallback irradiance
    }

    // 1. PV Array Size (Wp)
    // Estimate the total DC power output needed from panels.
    // Required energy generation = Daily need / (1 - estimated system losses)
    // Losses include inverter efficiency, wiring, temperature derating, dirt etc.
    const requiredEnergyFromPV_kWh = dailyEnergyKWh / (1 - systemLosses);
    // Convert energy needed (kWh/day) to power needed (kWp) using irradiance (kWh/m2/day -> effectively peak sun hours)
    // Required Wp = (Energy needed per day (kWh) / Peak Sun Hours Equivalent (h) ) * 1000 (kW to W)
    const peakSunHoursEquivalent = irradiance;
    const requiredWp = (requiredEnergyFromPV_kWh / peakSunHoursEquivalent) * 1000;
    // Calculate number of panels based on the chosen wattage per panel (e.g., 550W)
    const numberOfPanels = Math.ceil(requiredWp / panelWattsOption);
    // Actual installed DC power based on the number of panels.
    const actualPanelWp = numberOfPanels * panelWattsOption;

    // 2. Battery Size (kWh)
    // Estimate total battery capacity needed to cover the desired autonomy period.
    // Energy needed for autonomy = Daily energy * (Autonomy hours / 24 hours) - Simplistic daily fraction approach.
    // More advanced: Calculate specific load during autonomy period (e.g., night load).
    const energyNeededForAutonomy_kWh = dailyEnergyKWh * (autonomyHours / 24);
    // Usable capacity needed = Energy for autonomy
    const requiredUsableBatteryKWh = energyNeededForAutonomy_kWh;
    // Total battery capacity = Usable capacity / Depth of Discharge (DoD)
    // Example: If 8 kWh usable is needed and DoD is 80%, Total = 8 / 0.8 = 10 kWh.
    const totalBatteryKWh = requiredUsableBatteryKWh / batteryDoD;

     // 3. Inverter Size (kW)
     // Determines the AC power output capability. Needs to handle peak load and potentially match PV array size.
     // Load-based size = Peak AC load (W) / 1000 * Surge Factor (e.g., 1.25 for 25% buffer)
     const loadBasedInverterKW = (peakLoadW / 1000) * 1.25;
     // PV-based size = Total PV array DC power (Wp) / 1000 (common for hybrid/grid-tied, ratio can vary)
     const pvBasedInverterKW = actualPanelWp / 1000;
     // Inverter size is often the MAX of load-based or PV-based requirements.
     const calculatedInverterKW = Math.max(loadBasedInverterKW, pvBasedInverterKW);
     // Suggest a standard market size inverter (e.g., 3, 5, 8 kW) that's >= calculated size.
     const standardInverterKW = getStandardInverterSize(calculatedInverterKW);


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
            description: `Approx. ${standardInverterKW} kW Inverter`,
            totalKW: standardInverterKW
        }
    };
};

const calculateROI = ({ totalSolarCost, dailyEnergyKWh, currentGridCostPerKwh = 30 }) => {
     console.log(`ROI Calc: Cost=${totalSolarCost}, DailyEnergy=${dailyEnergyKWh}, GridRate=${currentGridCostPerKwh} KES/kWh`);
     if (!currentGridCostPerKwh || currentGridCostPerKwh <= 0 || totalSolarCost <= 0 || dailyEnergyKWh <=0) {
        return { paybackYears: "N/A", estimatedAnnualSavings: "0", estimatedAnnualSavingsFormatted: "KES 0", warning: "Insufficient data for ROI calculation."};
     }
     const dailyGridCost = dailyEnergyKWh * currentGridCostPerKwh;
     const annualGridSavings = dailyGridCost * 365;
     // Avoid division by zero if savings are negligible
     const paybackYears = annualGridSavings > 0 ? totalSolarCost / annualGridSavings : Infinity;

     return {
        paybackYears: isFinite(paybackYears) ? paybackYears.toFixed(1) : "Over 50", // Cap display
        estimatedAnnualSavings: annualGridSavings.toFixed(0), // Use string for consistency if needed by PDF generator
        estimatedAnnualSavingsFormatted: annualGridSavings.toLocaleString('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        assumedGridCostPerKwh: currentGridCostPerKwh
     }
};

// Export all functions needed by the controller
module.exports = {
    calculateDailyEnergy,
    calculatePeakLoad,
    calculateSystemComponents,
    calculateROI
}; 