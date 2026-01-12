const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'student')) NOT NULL DEFAULT 'student',
            phone TEXT,
            reset_token TEXT,
            reset_expires DATETIME
        )`, (err) => {
            if (err) return;
            // Hot-fix for dev: add columns if not exist
            db.run("ALTER TABLE users ADD COLUMN reset_token TEXT", () => { });
            db.run("ALTER TABLE users ADD COLUMN reset_expires DATETIME", () => { });
        });

        // Rooms Table
        db.run(`CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            capacity INTEGER NOT NULL,
            location TEXT,
            status TEXT CHECK(status IN ('active', 'inactive')) NOT NULL DEFAULT 'active'
        )`);

        // Schedules Table (Available blocks)
        db.run(`CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            date TEXT NOT NULL, -- Format YYYY-MM-DD
            start_time TEXT NOT NULL, -- Format HH:MM
            end_time TEXT NOT NULL, -- Format HH:MM
            status TEXT CHECK(status IN ('available', 'booked', 'maintenance')) NOT NULL DEFAULT 'available',
            FOREIGN KEY(room_id) REFERENCES rooms(id)
        )`);

        // Reservations Table (Sprint 2)
        db.run(`CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            room_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT CHECK(status IN ('active', 'cancelled', 'completed')) NOT NULL DEFAULT 'active',
            reminded INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(room_id) REFERENCES rooms(id)
        )`, (err) => {
            if (err) return;
            // Hot-fix for dev: try to add column if table exists (ignore error if exists)
            db.run("ALTER TABLE reservations ADD COLUMN reminded INTEGER DEFAULT 0", () => { });
        });

        // Seed Admin User
        const adminEmail = 'admin@udla.edu.ec';
        const adminPass = 'admin123';
        const saltRounds = 10;

        db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
            if (err) {
                console.error("Error checking admin user:", err);
                return;
            }
            if (!row) {
                bcrypt.hash(adminPass, saltRounds, (err, hash) => {
                    if (err) {
                        console.error("Error hashing password:", err);
                        return;
                    }
                    db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                        ['Administrator', adminEmail, hash, 'admin'],
                        (err) => {
                            if (err) console.error("Error inserting admin:", err);
                            else console.log("Default admin user created.");
                        }
                    );
                });
            }
        });
    });
}

module.exports = db;
