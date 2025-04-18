const calculateDailyEnergy = (appliances) => {
    if (!Array.isArray(appliances)) return 0;
    return appliances.reduce((sum, app) => {
        const watts = app.wattage || 0;
        const hours = app.hours || 0;
        const qty = app.quantity || 1;
        return sum + (watts * hours * qty / 1000); // kWh
    }, 0);
};

const calculatePeakLoad = (appliances) => {
     if (!Array.isArray(appliances)) return 0;
     // Simplistic: Sum of all appliance wattages * quantity.
     // Real-world might need factors for non-simultaneous use.
     return appliances.reduce((sum, app) => sum + (app.wattage * app.quantity), 0);
};

const calculateSystemComponents = ({ dailyEnergyKWh, peakLoadW, irradiance, autonomyHours, systemLosses = 0.25, batteryDoD = 0.80, panelWattsOption = 550 }) => {
    console.log(`Sizing with: Energy=${dailyEnergyKWh.toFixed(2)}kWh, Peak=${peakLoadW}W, Irradiance=${irradiance}kWh/m2/day, Autonomy=${autonomyHours}h`);

    if (irradiance <= 0) {
        console.error("Sizing Error: Irradiance must be positive. Using fallback.");
        irradiance = 4.5; // Fallback irradiance
    }

    // 1. PV Array Size (Wp)
    const requiredEnergyFromPV_kWh = dailyEnergyKWh / (1 - systemLosses);
    const peakSunHoursEquivalent = irradiance; // Effective hours of peak sun based on avg irradiance
    const requiredWp = (requiredEnergyFromPV_kWh / peakSunHoursEquivalent) * 1000;
    const numberOfPanels = Math.ceil(requiredWp / panelWattsOption);
    const actualPanelWp = numberOfPanels * panelWattsOption;

    // 2. Battery Size (kWh)
    // Estimate energy needed during non-sun hours or desired autonomy period.
    const energyNeededForAutonomy_kWh = dailyEnergyKWh * (autonomyHours / 24); // Simplistic allocation
    const requiredUsableBatteryKWh = energyNeededForAutonomy_kWh;
    const totalBatteryKWh = requiredUsableBatteryKWh / batteryDoD;

     // 3. Inverter Size (kW)
     const loadBasedInverterKW = (peakLoadW / 1000) * 1.25; // Peak load + 25% buffer
     const pvBasedInverterKW = actualPanelWp / 1000;       // Match PV array size (common for hybrid)
     const calculatedInverterKW = Math.max(loadBasedInverterKW, pvBasedInverterKW);
     // Basic rounding up to nearest integer kW for simplicity now
     const inverterKW = Math.ceil(calculatedInverterKW);


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
};

const calculateROI = ({ totalSolarCost, dailyEnergyKWh, currentGridCostPerKwh = 30 }) => { // Default KES 30/kWh assumption
     console.log(`ROI Calc: Cost=${totalSolarCost}, DailyEnergy=${dailyEnergyKWh}, GridRate=${currentGridCostPerKwh} KES/kWh`);
     if (!currentGridCostPerKwh || currentGridCostPerKwh <= 0 || totalSolarCost <= 0 || dailyEnergyKWh <=0) {
        return { paybackYears: "N/A", estimatedAnnualSavings: "N/A", warning: "Insufficient data for ROI calculation."};
     }
     const dailyGridCost = dailyEnergyKWh * currentGridCostPerKwh;
     const annualGridSavings = dailyGridCost * 365;
     // Avoid division by zero if savings are negligible
     const paybackYears = annualGridSavings > 0 ? totalSolarCost / annualGridSavings : Infinity;

     return {
        paybackYears: isFinite(paybackYears) ? paybackYears.toFixed(1) : "Over 50", // Cap display
        estimatedAnnualSavings: annualGridSavings.toFixed(0), // Show savings as whole KES
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