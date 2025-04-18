const estimateComponentCosts = async (systemSize) => {
    console.log("Estimating component costs in KES");

    // --- Placeholder Cost Data (KES Estimates) ---
    // THESE ARE ROUGH ESTIMATES - NEED LOCAL MARKET RESEARCH!
    const costPerWp_Panels_KES = 50;     // KES per Watt peak (Panel only)
    const costPerWp_BoS_KES = 35;       // KES per Wp (Mounting, Wiring etc.)
    const costPerKWh_Battery_KES = 25000; // KES per kWh (LiFePO4 estimate)
    const costPerKW_Inverter_KES = 18000; // KES per kW (Hybrid inverter)
    const installCostFactor = 0.20;     // 20% of hardware cost for installation
    // --- End Placeholder Cost Data ---

    const panelHardwareCost = systemSize.panels.totalWp * costPerWp_Panels_KES;
    const bosCost = systemSize.panels.totalWp * costPerWp_BoS_KES;
    // Ensure battery KWh is a number before calculation
    const batteryKWh = typeof systemSize.battery.totalKWh === 'number' ? systemSize.battery.totalKWh : 0;
    const batteryCost = batteryKWh * costPerKWh_Battery_KES;
    const inverterCost = systemSize.inverter.totalKW * costPerKW_Inverter_KES;

    const totalHardwareCost = panelHardwareCost + bosCost + batteryCost + inverterCost;
    const installationCost = totalHardwareCost * installCostFactor;
    const totalSystemCost = totalHardwareCost + installationCost;

    // Format costs to KES with commas
    const formatKES = (value) => {
         return value.toLocaleString('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };


    return {
         breakdown: [
            { component: 'PV Panels', description: `${systemSize.panels.panelCount} x ${systemSize.panels.panelWattage}W`, unitCostEst: `~${costPerWp_Panels_KES}/Wp`, totalCost: panelHardwareCost },
            { component: 'Balance of System', description: 'Mounting, Wiring etc.', unitCostEst: `~${costPerWp_BoS_KES}/Wp`, totalCost: bosCost },
            { component: 'Battery Storage', description: `${batteryKWh.toFixed(1)} kWh Total`, unitCostEst: `~${costPerKWh_Battery_KES.toLocaleString('en-KE')}/kWh`, totalCost: batteryCost },
            { component: 'Hybrid Inverter', description: `${systemSize.inverter.totalKW} kW`, unitCostEst: `~${costPerKW_Inverter_KES.toLocaleString('en-KE')}/kW`, totalCost: inverterCost },
            { component: 'Installation Estimate', description: `Approx. ${(installCostFactor * 100).toFixed(0)}% of Hardware`, totalCost: installationCost },
        ].map(item => ({ ...item, totalCostFormatted: formatKES(item.totalCost) })), // Add formatted cost
        total: totalSystemCost,
        totalFormatted: formatKES(totalSystemCost),
        currency: "KES (Estimate)", // Kenyan Shillings
        notes: "Costs are budget estimates based on general market data, not quotes. Prices vary significantly based on brand, installer, and location."
    };
};

module.exports = { estimateComponentCosts }; 