const express = require('express');
const db = require('../database');
const router = express.Router();

// Middleware to check if admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

// List all rooms (For admin) or available rooms (For student - specific endpoint usually)
router.get('/', (req, res) => {
    // Admin sees all, Student sees active? 
    // Requirement says: "Consultar salas disponibles" (Student) and "Gestionar salas" (Admin)
    // We'll return all rooms here, frontend can filter or we filter by query param.
    db.all("SELECT * FROM rooms", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Create Room (Admin)
router.post('/', isAdmin, (req, res) => {
    const { name, capacity, location } = req.body;
    db.run("INSERT INTO rooms (name, capacity, location) VALUES (?, ?, ?)",
        [name, capacity, location],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ id: this.lastID, message: 'Room created' });
        }
    );
});

// Update Room (Admin)
router.put('/:id', isAdmin, (req, res) => {
    const { name, capacity, location, status } = req.body;
    db.run("UPDATE rooms SET name=?, capacity=?, location=?, status=? WHERE id=?",
        [name, capacity, location, status, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Room updated' });
        }
    );
});

// Delete/Deactivate Room (Admin)
router.delete('/:id', isAdmin, (req, res) => {
    // Soft delete usually better, but requirement implies active/inactive status.
    // We'll just set status to inactive if that's the intention, or actual delete.
    // Let's do actual delete for now as per "Delete" in typical CRUD, 
    // but HU04 says "Desactivar". So user should use PUT to update status.
    // This endpoint will be actual DELETE for cleanup.
    db.run("DELETE FROM rooms WHERE id=?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Room deleted' });
    });
});

// Define Schedules (Admin)
router.post('/:id/schedules', isAdmin, (req, res) => {
    const { date, start_time, end_time } = req.body; // simple, single slot
    const room_id = req.params.id;

    // Check if end_time > start_time
    if (end_time <= start_time) {
        return res.status(400).json({ error: 'Invalid time range' });
    }

    db.run("INSERT INTO schedules (room_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
        [room_id, date, start_time, end_time],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Schedule added' });
        }
    );
});

// Get Availability (For Student)
// Pass date in query: /api/rooms/availability?date=2025-01-05
router.get('/availability', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date required' });

    // Logic: Find rooms that have schedules on this date? 
    // OR Logic: All rooms are available unless booked?
    // Requirement HU05: "Definir bloques de horario disponibles". 
    // So if a schedule exists in 'schedules' table with status 'available', it is available.

    const sql = `
        SELECT r.id, r.name, r.capacity, r.location, s.start_time, s.end_time, s.status
        FROM rooms r
        JOIN schedules s ON r.id = s.room_id
        WHERE r.status = 'active' 
        AND s.date = ? 
        AND s.status = 'available'
    `;

    db.all(sql, [date], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
