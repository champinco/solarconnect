// --- Placeholder Installer Data ---
// In a real app, this would come from the database (Supabase)
const placeholderInstallers = [
    {
        id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        company_name: 'Kenya Solar Solutions Ltd.',
        contact_person: 'Jane Doe',
        phone_number: '0712 345678',
        email: 'info@kenyass.co.ke',
        website: 'https://kenyass.co.ke',
        city: 'Nairobi',
        counties_served: ['Nairobi', 'Kiambu', 'Machakos'],
        services_offered: ['Residential Grid-Tied', 'Battery Backup', 'Commercial'],
        years_experience: 8,
        epra_license: 'EPRA/S/12345',
        profile_description: 'Experienced installers specializing in residential and commercial PV systems with battery backup integration.',
        logo_url: 'https://via.placeholder.com/100', // Placeholder logo
        is_verified: true,
        latitude: -1.286389,
        longitude: 36.817223,
    },
    {
        id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        company_name: 'Rift Valley Power Co.',
        contact_person: 'John Smith',
        phone_number: '0723 456789',
        email: 'contact@rvpower.co.ke',
        website: null,
        city: 'Nakuru',
        counties_served: ['Nakuru', 'Baringo', 'Laikipia', 'Nyandarua'],
        services_offered: ['Off-Grid Systems', 'Solar Water Pumping', 'Residential'],
        years_experience: 5,
        epra_license: 'EPRA/S/54321',
        profile_description: 'Your trusted partner for off-grid solar solutions and water pumping in the Rift Valley region.',
         logo_url: 'https://via.placeholder.com/100', // Placeholder logo
        is_verified: true,
         latitude: -0.303099,
         longitude: 36.080025,
    },
     {
        id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7f8a',
        company_name: 'Coastal Energy Systems',
        contact_person: null,
        phone_number: '0734 567890',
        email: 'sales@coastalenergy.ke',
        website: 'https://coastalenergy.ke',
        city: 'Mombasa',
        counties_served: ['Mombasa', 'Kilifi', 'Kwale'],
        services_offered: ['Residential Grid-Tied', 'Commercial', 'Maintenance'],
        years_experience: 3,
        epra_license: 'EPRA/S/67890',
        profile_description: 'Providing reliable solar installations and maintenance services for coastal homes and businesses.',
         logo_url: null, // No logo example
        is_verified: false, // Example of unverified
         latitude: -4.043477,
         longitude: 39.668205,
    }
];
// --- End Placeholder Data ---

// Controller function to get all installers
exports.getAllInstallers = async (req, res, next) => {
    try {
        console.log("API: Fetching installers list (using placeholders)");
        // TODO: Implement filtering based on query params (e.g., req.query.city, req.query.service)
        // const { city, service } = req.query;

        // Simulate database call delay
        await new Promise(resolve => setTimeout(resolve, 50));

        // In real app: Fetch from Supabase DB
        // const { data, error } = await supabase.from('installers').select('*').eq('is_verified', true); // Example query
        // if (error) throw error;
        // res.json(data);

        // Return placeholder data for now
        res.json(placeholderInstallers);

    } catch (error) {
        console.error("Error fetching installers:", error);
        next(error); // Pass error to the central error handler
    }
};

// Controller function to get a single installer by ID (placeholder for future)
exports.getInstallerById = async (req, res, next) => {
     try {
        const { id } = req.params;
        console.log(`API: Fetching installer with ID: ${id} (using placeholders)`);
        // Simulate DB call
        await new Promise(resolve => setTimeout(resolve, 50));
        const installer = placeholderInstallers.find(inst => inst.id === id);

        if (installer) {
            res.json(installer);
        } else {
             // Send 404 if not found
             const error = new Error('Installer not found');
             error.statusCode = 404;
             next(error);
        }
     } catch (error) {
         console.error("Error fetching installer by ID:", error);
         next(error);
     }
}; 