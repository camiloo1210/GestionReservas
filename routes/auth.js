const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const router = express.Router();

// Register Student
router.post('/register', (req, res) => {
    const { name, email, password, phone } = req.body;

    // Validate domain
    if (!email.endsWith('@udla.edu.ec')) {
        return res.status(400).json({ error: 'Must use a @udla.edu.ec email' });
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Server error' });

        const sql = `INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, 'student', ?)`;
        db.run(sql, [name, email, hash, phone], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            if (result) {
                // Set session
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
                res.json({ message: 'Login successful', role: user.role });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Get Current User
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

module.exports = router;
