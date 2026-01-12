const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const logger = require('../utils/logger');
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
                    role: user.role,
                    phone: user.phone
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

// Update Profile (Sprint 3)
router.put('/profile', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });

    const { name, phone } = req.body;
    const userId = req.session.user.id;

    db.run("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, userId], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Update session
        req.session.user.name = name;
        req.session.user.phone = phone;
        res.json({ message: 'Profile updated' });
    });
});

// Logout
// Forgot Password (HU17)
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            logger.error(`Error DB Forgot Password: ${err.message}`);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        // Security: Always return success message even if email not found
        if (!user) {
            logger.warn(`Forgot Password attempt for non-existent email: ${email}`);
            return res.json({ message: 'Si el correo existe, recibirás instrucciones.' });
        }

        // Generate Token (Simple random string)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = Date.now() + 3600000; // 1 hour

        db.run("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", [token, expires, user.id], (err) => {
            if (err) return res.status(500).json({ error: 'Error generando token' });

            // Mock Email Sending (HU17 Criteria)
            logger.info(`[EMAIL MOCK] Recuperación de contraseña para ${email}`);
            logger.info(`[LINK] http://localhost:3001/reset_password.html?token=${token}`);

            res.json({ message: 'Si el correo existe, recibirás instrucciones.' });
        });
    });
});

// Reset Password (HU17)
router.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    // Check token and expiration
    db.get("SELECT * FROM users WHERE reset_token = ?", [token], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        if (user.reset_expires < Date.now()) {
            return res.status(400).json({ error: 'El token ha expirado. Solicita uno nuevo.' });
        }

        // Hash new password
        const saltRounds = 10;
        bcrypt.hash(newPassword, saltRounds, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Error encriptando password' });

            db.run("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
                [hash, user.id],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Error actualizando password' });
                    logger.info(`Password reset success for user ${user.email}`);
                    res.json({ message: 'Contraseña actualizada correctamente' });
                }
            );
        });
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});


module.exports = router;
