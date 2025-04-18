import React from 'react';

// Define interface for Installer props (subset of DB schema)
interface Installer {
    id: string;
    company_name: string;
    city: string;
    counties_served: string[];
    services_offered: string[];
    years_experience?: number;
    phone_number?: string;
    email?: string;
    website?: string;
    logo_url?: string | null;
    is_verified: boolean;
}

interface InstallerCardProps {
  installer: Installer;
}

function InstallerCard({ installer }: InstallerCardProps) {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition-shadow duration-200 flex flex-col md:flex-row gap-4">
        {/* Logo */}
         <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden mx-auto md:mx-0">
            {installer.logo_url ? (
                <img src={installer.logo_url} alt={`${installer.company_name} logo`} className="object-contain w-full h-full" />
            ) : (
                 <span className="text-gray-400 text-xs">No Logo</span>
            )}
        </div>

        {/* Details */}
        <div className="flex-grow">
            <h3 className="text-lg font-semibold text-blue-700 mb-1 flex items-center">
                {installer.company_name}
                {installer.is_verified && <span className="ml-2 text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full">Verified</span>}
            </h3>
            <p className="text-sm text-gray-600 mb-1"><strong>Location:</strong> {installer.city}</p>
            {installer.years_experience && <p className="text-sm text-gray-600 mb-2"><strong>Experience:</strong> {installer.years_experience} years</p>}

             <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">Services:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {installer.services_offered.slice(0, 3).map(service => ( // Show first 3 services
                         <span key={service} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{service}</span>
                    ))}
                     {installer.services_offered.length > 3 && <span className="text-xs text-gray-500 italic ml-1">...</span>}
                </div>
             </div>

             {/* Contact Info (Optional) */}
             <div className="text-xs mt-3 border-t pt-2">
                {installer.phone_number && <p className="text-gray-700">Tel: {installer.phone_number}</p>}
                 {installer.email && <p className="text-gray-700">Email: {installer.email}</p>}
                 {installer.website && <a href={installer.website.startsWith('http') ? installer.website : `https://${installer.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website</a>}
             </div>

            {/* TODO: Add link to full profile page later */}
        </div>

    </div>
  );
}

export default InstallerCard; 