const express = require('express');
const db = require('../database');
const router = express.Router();

// Middleware to check auth
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Debes iniciar sesión' });
    }
}

// Create Reservation
router.post('/', isAuthenticated, (req, res) => {
    const { room_id, date, start_time, end_time } = req.body;
    const user_id = req.session.user.id;

    // 1. Basic Validation
    if (!room_id || !date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    // 2. Check Overlap
    // "No overlapping" means: existing.start < new.end AND existing.end > new.start
    const checkSql = `
        SELECT id FROM reservations 
        WHERE room_id = ? 
        AND date = ? 
        AND status = 'active'
        AND start_time < ? 
        AND end_time > ?
    `;

    db.get(checkSql, [room_id, date, end_time, start_time], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });

        if (row) {
            return res.status(409).json({ error: 'La sala ya está reservada en ese horario (Conflicto de horario).' });
        }

        // 3. Create Reservation
        const insertSql = `
            INSERT INTO reservations (user_id, room_id, date, start_time, end_time)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(insertSql, [user_id, room_id, date, start_time, end_time], function (err) {
            if (err) return res.status(500).json({ error: 'Error al guardar reserva' });

            // Optional: Update schedules table to 'booked'? 
            // For now, we rely on the reservations table to be the source of truth for "booked" slots 
            // and schedules table for "available definitions". 
            // But strict requirement says "Avail blocks of time". 
            // So if 'Available' is defined, we just booked within it.

            res.status(201).json({
                message: 'Reserva creada exitosamente',
                id: this.lastID
            });
        });
    });
});

// Get My Reservations
router.get('/my-reservations', isAuthenticated, (req, res) => {
    const user_id = req.session.user.id;
    const sql = `
        SELECT r.id, r.date, r.start_time, r.end_time, r.status, rm.name as room_name, rm.location
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        WHERE r.user_id = ?
        ORDER BY r.date DESC, r.start_time DESC
    `;
    db.all(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error obteniendo reservas' });
        res.json(rows);
    });
});

// Get All Reservations (Admin - Sprint 3)
router.get('/all', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { date, room_id } = req.query;
    let sql = `
        SELECT r.id, r.date, r.start_time, r.end_time, r.status, 
               rm.name as room_name, u.name as user_name, u.email as user_email
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        JOIN users u ON r.user_id = u.id
        WHERE 1=1
    `;
    const params = [];

    if (date) {
        sql += " AND r.date = ?";
        params.push(date);
    }
    if (room_id) {
        sql += " AND r.room_id = ?";
        params.push(room_id);
    }

    sql += " ORDER BY r.date DESC, r.start_time ASC";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error BD' });
        res.json(rows);
    });
});

// Cancel Reservation
router.post('/:id/cancel', isAuthenticated, (req, res) => {
    const reservationId = req.params.id;
    const user_id = req.session.user.id;

    // Check ownership
    db.get("SELECT user_id, status FROM reservations WHERE id = ?", [reservationId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error BD' });
        if (!row) return res.status(404).json({ error: 'Reserva no encontrada' });

        // Allow if owner OR Admin (Sprint 3 requirement)
        if (row.user_id !== user_id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        if (row.status !== 'active') {
            // Admin might want to cancel even if 'completed' in edge cases? 
            // But usually we just cancel 'active'. 
            // Requirement says "Cancelar reservas".
            // Let's stick to active for logical consistency unless forced.
            // If Admin, maybe we allow forcing but let's keep simple.
            return res.status(400).json({ error: 'La reserva no está activa' });
        }

        db.run("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [reservationId], function (err) {
            if (err) return res.status(500).json({ error: 'Error cancelando reserva' });

            // Sprint 3: Log reminder cancelled?
            res.json({ message: 'Reserva cancelada' });
        });
    });
});

module.exports = router;
