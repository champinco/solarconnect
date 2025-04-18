import React, { ChangeEvent } from 'react';

interface AutonomyInputProps {
  autonomyHours: number;
  onAutonomyChange: (hours: number) => void;
}

function AutonomyInput({ autonomyHours, onAutonomyChange }: AutonomyInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAutonomyChange(parseInt(e.target.value, 10));
  };

  return (
     <div className="p-5 border rounded-lg shadow-md bg-white">
       <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">3. Backup Power Needs (Autonomy)</h3>
       <p className="text-sm text-gray-600 mb-3">How many hours of backup power do you need from batteries when there's no sun (e.g., overnight, cloudy days)? Affects battery size.</p>
       <div className="flex items-center space-x-4">
            <label htmlFor="autonomy" className="font-medium text-gray-700 whitespace-nowrap">Hours of Autonomy:</label>
            <input
                type="range"
                id="autonomy"
                name="autonomy"
                min="0" // 0 = Grid-tied focus, no backup
                max="48" // Max 2 days
                step="1"
                value={autonomyHours}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="font-semibold text-blue-600 text-lg w-12 text-right">{autonomyHours} hr{autonomyHours !== 1 ? 's' : ''}</span>
       </div>
        <p className="text-xs text-gray-500 mt-2">
            Common values: 0 (Grid-Tied), 8-12 (Overnight), 24 (Full Day Backup). Higher autonomy significantly increases battery cost.
        </p>
    </div>
  );
}

export default AutonomyInput; 