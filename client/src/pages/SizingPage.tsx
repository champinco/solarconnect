import React, { useState } from 'react';
import ApplianceInput from '../components/ApplianceInput';
import LocationInput from '../components/LocationInput';
import AutonomyInput from '../components/AutonomyInput';
import GridCostInput from '../components/GridCostInput';
import ResultsDisplay from '../components/ResultsDisplay';
import axios from 'axios'; // Import axios

// Define the structure for selected appliances
interface SelectedAppliance {
  id: number | string;
  name: string;
  wattage: number;
  hours: number;
  quantity: number;
}

// Define structure for results (matching backend response)
// You might want to move this to a types.ts file later
 interface CalculationResults {
    meta: { timestamp: string; pvgisDataSource: string; irradianceUsed: number; };
    inputsReceived: { location: { lat: number; lon: number }; autonomyHours: number; assumedGridCostPerKwh?: number; };
    calculatedNeeds: { dailyEnergyKWh: string; peakLoadW: string; };
    recommendedSystem: {
        panels: { description: string; totalWp: number; panelCount: number; panelWattage: number; };
        battery: { description: string; totalKWh: number; usableKWh: number; autonomyHours: number; dodUsed: number; };
        inverter: { description: string; totalKW: number; };
    };
    estimatedCost: {
        breakdown: Array<{ component: string; description: string; totalCost: number; totalCostFormatted: string; unitCostEst?: string; }>;
        total: number;
        totalFormatted: string;
        currency: string;
        notes: string;
    };
    roiAnalysis: {
        paybackYears: string;
        estimatedAnnualSavings: string;
        estimatedAnnualSavingsFormatted: string;
        warning?: string;
        assumedGridCostPerKwh?: number;
    };
}


function SizingPage() {
    const [selectedAppliances, setSelectedAppliances] = useState<SelectedAppliance[]>([]);
    const [location, setLocation] = useState({ lat: '', lon: '' });
    const [autonomyHours, setAutonomyHours] = useState(10); // Default autonomy
    const [gridCost, setGridCost] = useState(''); // KES per kWh
    const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdateAppliances = (appliances: SelectedAppliance[]) => {
        setSelectedAppliances(appliances);
         // Clear results if inputs change
         setCalculationResults(null);
         setError(null);
    };

    const handleLocationChange = (newLocation: { lat: string; lon: string }) => {
        setLocation(newLocation);
        setCalculationResults(null);
        setError(null);
    };

     const handleAutonomyChange = (hours: number) => {
        setAutonomyHours(hours);
        setCalculationResults(null);
        setError(null);
    };

     const handleGridCostChange = (cost: string) => {
         setGridCost(cost);
         setCalculationResults(null);
         // Don't clear calculation error if only grid cost changes
         // setError(null);
     };


    const handleCalculate = async () => {
        setError(null); // Clear previous errors
        setCalculationResults(null); // Clear previous results

        // --- Input Validation ---
        if (selectedAppliances.length === 0) {
            setError("Please add at least one appliance.");
            return;
        }
         const latNum = parseFloat(location.lat);
         const lonNum = parseFloat(location.lon);
         if (isNaN(latNum) || isNaN(lonNum)) {
             setError("Please enter a valid numeric Latitude and Longitude, or use 'Get My Location'.");
             return;
         }
         const gridCostNum = gridCost ? parseFloat(gridCost) : undefined;
         if (gridCost && (isNaN(gridCostNum) || gridCostNum < 0)) {
              setError("Invalid Grid Cost. Please enter a non-negative number or leave blank.");
              return;
         }
         // --- End Validation ---


        setIsLoading(true);

        const payload = {
            appliances: selectedAppliances.map(a => ({ // Ensure only necessary data is sent
                name: a.name,
                wattage: a.wattage,
                hours: a.hours,
                quantity: a.quantity
            })),
            location: { lat: latNum, lon: lonNum },
            autonomyHours: autonomyHours,
            gridCostPerKwh: gridCostNum // Send number or undefined
        };

        console.log('Sending payload to backend:', payload);

        try {
            // Use the correct backend URL (adjust if your server runs elsewhere)
            const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const response = await axios.post<CalculationResults>(`${backendUrl}/api/calculate`, payload, {
                timeout: 20000 // 20 second timeout for calculation + PVGIS
            });

            console.log('Received response from backend:', response.data);
            setCalculationResults(response.data);

        } catch (err: any) {
             console.error("API Call failed:", err);
             if (axios.isAxiosError(err)) {
                 if (err.response) {
                     // Backend responded with an error status code (4xx, 5xx)
                      const errorMsg = err.response.data?.error || `Request failed with status ${err.response.status}`;
                      setError(`Calculation Error: ${errorMsg}`);
                 } else if (err.request) {
                      // Request was made but no response received (network error, server down)
                      setError("Network Error: Could not connect to the calculation server. Please try again later.");
                 } else {
                      // Something happened setting up the request
                      setError(`Error: ${err.message}`);
                 }
             } else {
                  // Not an Axios error
                  setError(`An unexpected error occurred: ${err.message}`);
             }
             setCalculationResults(null); // Clear results on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <ApplianceInput
                selectedAppliances={selectedAppliances}
                onUpdateAppliances={handleUpdateAppliances}
            />
            <LocationInput
                location={location}
                onLocationChange={handleLocationChange}
            />
             <AutonomyInput
                autonomyHours={autonomyHours}
                onAutonomyChange={handleAutonomyChange}
            />
             <GridCostInput
                gridCost={gridCost}
                onGridCostChange={handleGridCostChange}
            />

            <div className="text-center mt-8">
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                    {isLoading ? 'Calculating...' : 'Calculate My Solar System'}
                </button>
            </div>

             {/* Display Error Messages */}
             {error && (
                <div className="mt-4 p-4 border border-red-400 bg-red-100 text-red-700 rounded-lg text-center">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                </div>
             )}


             {/* Display Results */}
             {isLoading && (
                <div className="text-center mt-4">
                    <p className="text-blue-600 animate-pulse">Calculating system size and fetching solar data...</p>
                     {/* Optional: Add a spinner */}
                </div>
             )}

             {calculationResults && !isLoading && <ResultsDisplay data={calculationResults} />}

        </div>
    );
}

export default SizingPage; 