import React, { useState } from 'react';
import jsPDF from 'jspdf'; // Import jsPDF

// Define a type for the expected results data structure
// This should match the structure returned by the backend API
interface CalculationResults {
    meta: {
        timestamp: string;
        pvgisDataSource: string;
        irradianceUsed: number;
    };
    inputsReceived: {
        location: { lat: number; lon: number };
        autonomyHours: number;
        assumedGridCostPerKwh?: number;
    };
    calculatedNeeds: {
        dailyEnergyKWh: string;
        peakLoadW: string;
    };
    recommendedSystem: {
        panels: { description: string; totalWp: number; panelCount: number; panelWattage: number };
        battery: { description: string; totalKWh: number; usableKWh: number; autonomyHours: number; dodUsed: number };
        inverter: { description: string; totalKW: number };
    };
    estimatedCost: {
        breakdown: Array<{ component: string; description: string; totalCostFormatted: string; totalCost: number }>;
        totalFormatted: string;
        total: number;
        currency: string;
        notes: string;
    };
    roiAnalysis: {
        paybackYears: string;
        estimatedAnnualSavingsFormatted: string;
        estimatedAnnualSavings: string;
        warning?: string;
        assumedGridCostPerKwh?: number;
    };
}


interface ResultsDisplayProps {
  data: CalculationResults | null; // Can be null initially
}

function ResultsDisplay({ data }: ResultsDisplayProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!data) {
    return null; // Don't render anything if there's no data
  }

  // --- PDF Generation Logic ---
  const handleGeneratePdf = () => {
     if (!data) return;
     setIsGeneratingPdf(true);

     try {
        const doc = new jsPDF();
        const margin = 15;
        let yPos = margin; // Track vertical position

        // --- Helper Function for adding text ---
        const addText = (text: string, x: number, size = 10, style = 'normal') => {
             doc.setFontSize(size);
             doc.setFont('helvetica', style); // Set font style
             doc.text(text, x, yPos);
             // Simple line wrap simulation (adjust line height as needed)
             const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - margin * 2);
             yPos += (lines.length > 1 ? lines.length * (size * 0.4) : (size * 0.5)); // Adjust line height based on size
        };

         const addTitle = (text: string) => {
             yPos += 5; // Space before title
             doc.setFontSize(16);
             doc.setFont('helvetica', 'bold');
             doc.text(text, margin, yPos);
             yPos += 10; // Space after title
             doc.setLineWidth(0.2);
             doc.line(margin, yPos - 6, doc.internal.pageSize.width - margin, yPos - 6); // Underline
         };

         const addSubtitle = (text: string) => {
             yPos += 4; // Space before subtitle
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.text(text, margin, yPos);
             yPos += 7;
         };

         const addLineItem = (label: string, value: string) => {
             doc.setFontSize(10);
             doc.setFont('helvetica', 'bold');
             doc.text(label, margin, yPos);
             doc.setFont('helvetica', 'normal');
             doc.text(value, margin + 50, yPos); // Adjust horizontal position for value
             yPos += 6;
         };


        // --- PDF Content ---
        addTitle("Solar System Sizing Report - SolarConnect");
        addText(`Generated: ${new Date(data.meta.timestamp).toLocaleString()}`, margin);
        yPos += 5;

        // Input Summary
        addSubtitle("Input Summary");
        addLineItem("Location:", `Lat: ${data.inputsReceived.location.lat}, Lon: ${data.inputsReceived.location.lon}`);
        addLineItem("Desired Autonomy:", `${data.inputsReceived.autonomyHours} hours`);
        if (data.inputsReceived.assumedGridCostPerKwh) {
            addLineItem("Grid Cost Used (ROI):", `${data.inputsReceived.assumedGridCostPerKwh} ${data.estimatedCost.currency.split(' ')[0]}/kWh`);
        }
        addLineItem("Solar Irradiance:", `${data.meta.irradianceUsed} kWh/m²/day (${data.meta.pvgisDataSource})`);
        yPos += 5;

        // Calculated Needs
        addSubtitle("Calculated Energy Needs");
        addLineItem("Avg. Daily Energy:", `${data.calculatedNeeds.dailyEnergyKWh} kWh`);
        addLineItem("Estimated Peak Load:", `${data.calculatedNeeds.peakLoadW} W`);
        yPos += 5;

        // Recommended System
        addSubtitle("Recommended System Size");
        addLineItem("PV Panels:", `${data.recommendedSystem.panels.description} (${data.recommendedSystem.panels.totalWp} Wp)`);
        addLineItem("Battery Storage:", data.recommendedSystem.battery.description);
        addLineItem("Inverter:", data.recommendedSystem.inverter.description);
        yPos += 5;

         // Estimated Cost
         addSubtitle(`Budgetary Cost Estimate (${data.estimatedCost.currency})`);
         addText(data.estimatedCost.notes, margin, 8, 'italic'); // Smaller italic notes
         yPos += 2;
         data.estimatedCost.breakdown.forEach(item => {
             addLineItem(`${item.component}:`, `${item.description} -> ${item.totalCostFormatted}`);
         });
         yPos += 2; // Extra space before total
         addLineItem("Total Estimated Cost:", data.estimatedCost.totalFormatted);
         yPos += 5;


         // ROI Analysis
         addSubtitle("Return on Investment (ROI) Analysis");
          if (data.roiAnalysis.warning) {
             addText(`Note: ${data.roiAnalysis.warning}`, margin, 9, 'italic');
          }
         addLineItem("Estimated Payback Period:", `${data.roiAnalysis.paybackYears} Years`);
         addLineItem("Estimated Annual Savings:", `${data.roiAnalysis.estimatedAnnualSavingsFormatted}`);
         yPos += 10;

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Disclaimer: This report provides estimates for planning purposes only. Consult qualified installers for detailed quotes.", margin, doc.internal.pageSize.height - 10);


        // Save the PDF
        doc.save(`SolarConnect_Report_${Date.now()}.pdf`);

     } catch (error) {
         console.error("Error generating PDF:", error);
         alert("Failed to generate PDF report. See console for details.");
     } finally {
        setIsGeneratingPdf(false);
     }
  };
  // --- End PDF Logic ---


  return (
    <div className="p-5 border rounded-lg shadow-lg bg-gradient-to-br from-white to-gray-50 mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-center text-green-700 mb-4 border-b pb-3">Calculation Results</h2>

       {/* Grouping sections for clarity */}
       <section className="p-4 border rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Summary & Needs</h3>
             <p className="text-sm mb-1">Energy Needs: <strong>{data.calculatedNeeds.dailyEnergyKWh} kWh/day</strong></p>
             <p className="text-sm mb-1">Peak Load: <strong>{data.calculatedNeeds.peakLoadW} W</strong></p>
             <p className="text-xs text-gray-500">Based on Lat: {data.inputsReceived.location.lat}, Lon: {data.inputsReceived.location.lon}</p>
             <p className="text-xs text-gray-500">Solar Irradiance: {data.meta.irradianceUsed} kWh/m²/day ({data.meta.pvgisDataSource})</p>
             <p className="text-xs text-gray-500">Desired Autonomy: {data.inputsReceived.autonomyHours} hours</p>
       </section>

      <section className="p-4 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Recommended System Size</h3>
        <ul className="list-none space-y-1 text-gray-700">
          <li className="flex items-center"><span className="text-blue-600 mr-2">&#10004;</span><strong>PV Panels:</strong>&nbsp;{data.recommendedSystem.panels.description} ({data.recommendedSystem.panels.totalWp} Wp)</li>
          <li className="flex items-center"><span className="text-blue-600 mr-2">&#10004;</span><strong>Battery:</strong>&nbsp;{data.recommendedSystem.battery.description}</li>
          <li className="flex items-center"><span className="text-blue-600 mr-2">&#10004;</span><strong>Inverter:</strong>&nbsp;{data.recommendedSystem.inverter.description}</li>
        </ul>
      </section>

      <section className="p-4 border rounded-md bg-blue-50 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">3. Budgetary Cost Estimate ({data.estimatedCost.currency})</h3>
         <p className="text-xs text-red-600 italic mb-3">{data.estimatedCost.notes}</p>
        <div className="space-y-2 text-sm">
            {data.estimatedCost.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-1">
                    <span className="font-medium">{item.component}: <span className="text-gray-600 font-normal">{item.description}</span></span>
                    <span className="font-medium text-right">{item.totalCostFormatted}</span>
                </div>
            ))}
        </div>
         <div className="flex justify-end mt-3 pt-2 border-t">
            <span className="font-semibold text-gray-900 text-base">Total Estimated Cost:</span>
            <span className="font-semibold text-gray-900 text-base ml-4">{data.estimatedCost.totalFormatted}</span>
         </div>
      </section>

      <section className="p-4 border rounded-md bg-green-50 shadow-sm">
        <h3 className="text-lg font-semibold text-green-800 mb-2">4. Return on Investment (ROI) Analysis</h3>
         {data.roiAnalysis.warning && <p className="text-sm text-orange-700 italic mb-2">{data.roiAnalysis.warning}</p>}
         {data.roiAnalysis.assumedGridCostPerKwh && <p className="text-xs text-gray-600 mb-2">Using assumed grid cost of {data.roiAnalysis.assumedGridCostPerKwh} {data.estimatedCost.currency.split(' ')[0]}/kWh.</p>}
         <div className="flex justify-around items-center text-center mt-2">
             <div>
                 <p className="text-sm text-gray-600">Estimated Payback</p>
                 <p className="text-2xl font-bold text-green-700">{data.roiAnalysis.paybackYears}<span className="text-base font-normal"> Years</span></p>
             </div>
             <div>
                 <p className="text-sm text-gray-600">Est. Annual Savings</p>
                 <p className="text-2xl font-bold text-green-700">{data.roiAnalysis.estimatedAnnualSavingsFormatted}</p>
             </div>
         </div>
      </section>

       {/* PDF Download Button */}
       <div className="text-center mt-6 pt-4 border-t">
             <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-wait"
            >
                {isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}
            </button>
       </div>
    </div>
  );
}

export default ResultsDisplay; 