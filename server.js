const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./database');
const logger = require('./utils/logger');

const app = express();
const PORT = 3001;

// Global Error Handler for uncaught exceptions (Validation HU15)
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'udla_reservas_secret_key', // In prod, use env var
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set true if using HTTPS
}));

// Request Logger Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes Placeholder
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservations');
const reportsRoutes = require('./routes/reports');
const { checkUpcomingReservations } = require('./utils/reminders');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportsRoutes);

// Reminders Interval (HU13)
setInterval(() => {
    try {
        checkUpcomingReservations(db);
    } catch (e) { console.error(e); }
}, 60000);

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
