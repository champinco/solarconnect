import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstallerCard from '../components/InstallerCard'; // Import the card component

// Match the Installer interface used in InstallerCard
interface Installer {
    id: string; company_name: string; city: string; counties_served: string[];
    services_offered: string[]; years_experience?: number; phone_number?: string;
    email?: string; website?: string; logo_url?: string | null; is_verified: boolean;
}

function InstallerDirectoryPage() {
    const [installers, setInstallers] = useState<Installer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInstallers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                const response = await axios.get<Installer[]>(`${backendUrl}/api/installers`);
                setInstallers(response.data);
            } catch (err: any) {
                console.error("Failed to fetch installers:", err);
                const errorMsg = axios.isAxiosError(err) && err.response?.data?.error
                    ? err.response.data.error
                    : err.message;
                setError(`Failed to load installers: ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInstallers();
    }, []); // Empty dependency array means this runs once on component mount

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verified Solar Installers Directory</h2>

            {/* TODO: Add Filtering Options Here (City, Service etc.) */}

            {isLoading && (
                <div className="text-center p-10">
                    <p className="text-blue-600 animate-pulse">Loading installers...</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 border border-red-400 bg-red-100 text-red-700 rounded-lg text-center">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && installers.length === 0 && (
                <div className="text-center p-10 text-gray-500">
                    <p>No installers found matching the criteria.</p>
                    <p className="text-sm">(Currently showing placeholder data)</p>
                </div>
            )}

            {!isLoading && !error && installers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {installers.map(installer => (
                        <InstallerCard key={installer.id} installer={installer} />
                    ))}
                </div>
            )}
            <p className="text-center text-xs text-gray-500 mt-8">Disclaimer: This directory uses placeholder data. Verification processes are under development. Always perform due diligence when selecting an installer.</p>

        </div>
    );
}

export default InstallerDirectoryPage; 