const express = require('express');
const cors = require('cors'); // Allow requests from frontend

const calculationRoutes = require('./routes/calculationRoutes');
const installerRoutes = require('./routes/installerRoutes'); // Import installer routes
// const installerRoutes = require('./routes/installerRoutes'); // Future routes

const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for backend API

// --- Middleware ---
// Enable CORS for all origins (for development)
app.use(cors());
// Or restrict to your React app's development server URL:
// app.use(cors({ origin: 'http://localhost:3000' }));

// Parse JSON request bodies
app.use(express.json());

// --- Routes ---
app.get('/api', (req, res) => { // Simple check endpoint
  res.json({ message: 'Solar Sizer API is running!' });
});

app.use('/api/calculate', calculationRoutes);
app.use('/api/installers', installerRoutes); // Use installer routes
// app.use('/api/installers', installerRoutes); // Future use

// --- Basic Error Handling (Improved) ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  // Avoid leaking stack traces in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message;
  res.status(statusCode).json({ error: message });
});

// --- Not Found Handler ---
app.use((req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});