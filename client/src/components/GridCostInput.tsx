import React, { ChangeEvent } from 'react';

interface GridCostInputProps {
  gridCost: string; // Keep as string for input field flexibility
  onGridCostChange: (cost: string) => void;
}

function GridCostInput({ gridCost, onGridCostChange }: GridCostInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and a single decimal point
    const value = e.target.value;
     if (/^\d*\.?\d*$/.test(value)) {
          onGridCostChange(value);
     }
  };

  return (
    <div className="p-5 border rounded-lg shadow-md bg-white">
       <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">4. Current Electricity Cost (Optional)</h3>
       <p className="text-sm text-gray-600 mb-3">Enter your average cost per kWh from KPLC to estimate potential savings (ROI). Check your bill (approx. KES 25-40/kWh depending on usage band).</p>
       <div className="flex items-center space-x-2">
           <label htmlFor="gridCost" className="font-medium text-gray-700">Cost per kWh:</label>
           <input
                type="text" // Use text to allow gradual input
                inputMode="decimal" // Hint for mobile keyboards
                id="gridCost"
                name="gridCost"
                placeholder="e.g., 30"
                value={gridCost}
                onChange={handleChange}
                className="p-2 border rounded w-24 shadow-inner"
                aria-label="Grid cost per kWh"
            />
            <span className="text-gray-600">KES / kWh</span>
       </div>
       <p className="text-xs text-gray-500 mt-2">If left blank, an average rate will be assumed for ROI calculation.</p>
    </div>
  );
}

export default GridCostInput; 