import React, { useState, ChangeEvent, FormEvent } from 'react';

// Define interfaces for type safety
interface Appliance {
  id: number | string; // Allow string for custom IDs
  name: string;
  wattage: number;
  defaultHours?: number; // Optional for default list
  hours?: number;        // Added for selected items
  quantity?: number;     // Added for selected items
}

interface SelectedAppliance extends Appliance {
  hours: number;
  quantity: number;
}

interface ApplianceInputProps {
  selectedAppliances: SelectedAppliance[];
  onUpdateAppliances: (appliances: SelectedAppliance[]) => void;
}

// --- Placeholder Appliance Data (Simulating Dev 4's Task) ---
// In a real app, this would ideally come from a backend/database
const defaultAppliances: Appliance[] = [
    { id: 1, name: 'Fridge (Med)', wattage: 150, defaultHours: 24 },
    { id: 2, name: 'Fridge (Large)', wattage: 250, defaultHours: 24 },
    { id: 3, name: 'Deep Freezer', wattage: 200, defaultHours: 24 },
    { id: 10, name: 'LED Bulb (5W)', wattage: 5, defaultHours: 6 },
    { id: 11, name: 'LED Bulb (10W)', wattage: 10, defaultHours: 6 },
    { id: 12, name: 'Fluorescent Tube', wattage: 40, defaultHours: 6 },
    { id: 20, name: 'TV LED (32")', wattage: 40, defaultHours: 4 },
    { id: 21, name: 'TV LED (55")', wattage: 100, defaultHours: 4 },
    { id: 22, name: 'TV Old CRT', wattage: 150, defaultHours: 3 },
    { id: 30, name: 'Fan (Standing)', wattage: 50, defaultHours: 8 },
    { id: 31, name: 'Fan (Ceiling)', wattage: 75, defaultHours: 8 },
    { id: 40, name: 'Laptop Charger', wattage: 65, defaultHours: 5 },
    { id: 41, name: 'Desktop PC + Monitor', wattage: 200, defaultHours: 8 },
    { id: 42, name: 'Phone Charger', wattage: 10, defaultHours: 3 },
    { id: 50, name: 'Router/Modem', wattage: 15, defaultHours: 24 },
    { id: 60, name: 'Water Pump (0.5 HP)', wattage: 375, defaultHours: 0.5 },
    { id: 61, name: 'Water Pump (1 HP)', wattage: 750, defaultHours: 0.5 },
    { id: 70, name: 'Iron (Electric)', wattage: 1200, defaultHours: 0.25 },
    { id: 71, name: 'Kettle (Electric)', wattage: 1500, defaultHours: 0.1 },
    { id: 80, name: 'Radio/Stereo', wattage: 30, defaultHours: 3 },
    { id: 90, name: 'Security Light (LED)', wattage: 30, defaultHours: 12 },
    // --- Add more relevant Kenyan appliances ---
];
// --- End Placeholder Data ---

function ApplianceInput({ selectedAppliances, onUpdateAppliances }: ApplianceInputProps) {
  const [customName, setCustomName] = useState('');
  const [customWattage, setCustomWattage] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1');

  const handleAddDefault = (appliance: Appliance) => {
    const newAppliance: SelectedAppliance = {
      ...appliance,
      id: `selected-${Date.now()}-${appliance.id}`, // Unique ID for the list
      quantity: 1,
      hours: appliance.defaultHours ?? 1, // Use defaultHours or 1
    };
    // Avoid adding duplicates by name (optional check)
    if (!selectedAppliances.some(a => a.name === newAppliance.name)) {
         onUpdateAppliances([...selectedAppliances, newAppliance]);
    } else {
        alert(`${newAppliance.name} is already in your list. You can adjust its quantity.`);
    }
  };

  const handleAddCustom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const wattageNum = parseInt(customWattage, 10);
    const hoursNum = parseFloat(customHours);
    const quantityNum = parseInt(customQuantity, 10);

    if (customName && wattageNum > 0 && hoursNum >= 0 && hoursNum <= 24 && quantityNum > 0) {
      const newAppliance: SelectedAppliance = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        wattage: wattageNum,
        hours: hoursNum,
        quantity: quantityNum,
      };
      onUpdateAppliances([...selectedAppliances, newAppliance]);
      // Reset form
      setCustomName('');
      setCustomWattage('');
      setCustomHours('');
      setCustomQuantity('1');
    } else {
      alert('Please fill in all custom appliance details correctly (Name required, Wattage/Quantity > 0, Hours 0-24).');
    }
  };

  const handleRemove = (idToRemove: number | string) => {
    onUpdateAppliances(selectedAppliances.filter(app => app.id !== idToRemove));
  };

   const handleQuantityChange = (id: number | string, value: string) => {
    const quantity = Math.max(1, parseInt(value, 10) || 1);
    onUpdateAppliances(selectedAppliances.map(app =>
      app.id === id ? { ...app, quantity } : app
    ));
  };

  const handleHoursChange = (id: number | string, value: string) => {
     const hours = Math.max(0, Math.min(24, parseFloat(value) || 0)); // Clamp between 0 and 24
    onUpdateAppliances(selectedAppliances.map(app =>
      app.id === id ? { ...app, hours } : app
    ));
  };

  // Calculate total daily energy for display
  const totalDailyKWh = selectedAppliances.reduce((sum, app) => {
    return sum + (app.wattage * (app.hours || 0) * (app.quantity || 1) / 1000);
  }, 0).toFixed(2);

  return (
    <div className="p-5 border rounded-lg shadow-md bg-white">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">1. Your Appliances & Energy Use</h3>

      {/* Display Selected Appliances */}
      <div className="mb-6 space-y-3">
        <h4 className="font-medium text-gray-700">Selected Items:</h4>
        {selectedAppliances.length === 0 && <p className="text-gray-500 italic px-2">No appliances added yet. Select from common items or add custom ones below.</p>}
        {selectedAppliances.map((app) => (
          <div key={app.id} className="flex flex-wrap items-center justify-between p-2 border rounded-md bg-gray-50 gap-2">
            <span className="flex-grow font-medium mr-2 min-w-[150px]">{app.name} ({app.wattage}W)</span>
            <div className="flex items-center space-x-2 flex-wrap">
              <label htmlFor={`qty-${app.id}`} className="text-sm font-medium text-gray-600">Qty:</label>
              <input
                id={`qty-${app.id}`}
                type="number"
                min="1"
                value={app.quantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuantityChange(app.id, e.target.value)}
                className="w-16 p-1 border rounded text-sm shadow-inner"
                aria-label={`${app.name} quantity`}
              />
              <label htmlFor={`hrs-${app.id}`} className="text-sm font-medium text-gray-600 ml-2">Hrs/Day:</label>
              <input
                id={`hrs-${app.id}`}
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={app.hours}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleHoursChange(app.id, e.target.value)}
                className="w-20 p-1 border rounded text-sm shadow-inner" // Increased width slightly
                aria-label={`${app.name} hours per day`}
              />
            </div>
            <button onClick={() => handleRemove(app.id)} className="ml-2 text-red-600 hover:text-red-800 text-xl font-bold leading-none" title="Remove item">&times;</button>
          </div>
        ))}
        <p className="text-right font-semibold mt-3 text-lg text-blue-700">Estimated Total Daily Energy: {totalDailyKWh} kWh</p>
      </div>

      {/* Add Default Appliances */}
      <div className="mb-6">
        <h4 className="font-medium mb-2 text-gray-700">Add Common Appliances:</h4>
        <div className="flex flex-wrap gap-2">
          {defaultAppliances.map(app => (
            <button
              key={app.id}
              onClick={() => handleAddDefault(app)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors shadow-sm"
              title={`Add ${app.name} (${app.wattage}W, ~${app.defaultHours}h/day)`}
            >
              + {app.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Appliance Form */}
      <div>
        <h4 className="font-medium mb-2 text-gray-700">Add Custom Appliance:</h4>
        <form onSubmit={handleAddCustom} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end p-3 border rounded-md bg-gray-50">
            <input aria-label="Custom Appliance Name" type="text" placeholder="Appliance Name" value={customName} onChange={e => setCustomName(e.target.value)} required className="p-2 border rounded w-full shadow-inner" />
            <input aria-label="Custom Appliance Wattage" type="number" placeholder="Wattage (W)" value={customWattage} onChange={e => setCustomWattage(e.target.value)} min="1" required className="p-2 border rounded w-full shadow-inner" />
            <input aria-label="Custom Appliance Hours per Day" type="number" placeholder="Hours/Day" value={customHours} onChange={e => setCustomHours(e.target.value)} step="0.1" min="0" max="24" required className="p-2 border rounded w-full shadow-inner" />
            <input aria-label="Custom Appliance Quantity" type="number" placeholder="Quantity" value={customQuantity} onChange={e => setCustomQuantity(e.target.value)} min="1" required className="p-2 border rounded w-full shadow-inner" />
            <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors w-full sm:col-span-2 md:col-span-1 shadow">Add Custom</button>
        </form>
      </div>
    </div>
  );
}

export default ApplianceInput; 