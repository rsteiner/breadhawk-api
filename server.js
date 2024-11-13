require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const vendorRoutes = require('./src/routes/vendorRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const venueRoutes = require('./src/routes/venueRoutes');
const marketRoutes = require('./src/routes/marketRoutes');
const termRoutes = require('./src/routes/termRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/terms', termRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
