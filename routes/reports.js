const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware check
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado' });
    }
}

// GET /api/reports/usage?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/usage', isAdmin, (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Faltan fechas start y end' });
    }

    const sql = `
        SELECT rm.name as room_name, COUNT(r.id) as total_reservations
        FROM rooms rm
        LEFT JOIN reservations r ON rm.id = r.room_id 
             AND r.date BETWEEN ? AND ? 
             AND r.status != 'cancelled'
        GROUP BY rm.id
    `;

    db.all(sql, [start, end], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error DB' });
        res.json(rows);
    });
});

// GET /api/reports/detailed?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/detailed', isAdmin, (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Faltan fechas start y end' });
    }

    const sql = `
        SELECT r.date, r.start_time, r.end_time, rm.name as room_name, u.name as user_name
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        JOIN users u ON r.user_id = u.id
        WHERE r.date BETWEEN ? AND ? 
        AND r.status != 'cancelled'
        ORDER BY r.date, r.start_time
    `;

    db.all(sql, [start, end], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error DB' });
        res.json(rows);
    });
});

module.exports = router;
