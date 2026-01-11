// Sprint 4: Reminder System
const database = require('../database');

function sendReminder(email, r) {
    console.log(`[EMAIL MOCK] Enviando correo a: ${email}`);
    console.log(`[ASUNTO] Recordatorio: Reserva en ${r.room_name}`);
    console.log(`[CUERPO] Hola ${r.user_name}, recuerda tu reserva hoy ${r.date} de ${r.start_time} a ${r.end_time}.`);
}

function checkUpcomingReservations(db) {
    console.log('[SISTEMA] Verificando recordatorios...');

    // Logic: Find active reservations for TODAY, starting in the next ~60 mins, not yet reminded
    // For demo simplicity: We check reservations where date = today AND start_time is "soon"
    // Since dealing with time string "HH:MM" in SQL is tricky, we'll fetch today's active reservations and filter in JS

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const sql = `
        SELECT r.id, r.date, r.start_time, r.end_time, r.reminded,
               rm.name as room_name, u.name as user_name, u.email as user_email
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        JOIN users u ON r.user_id = u.id
        WHERE r.date = ? AND r.status = 'active' AND r.reminded = 0
    `;

    db.all(sql, [today], (err, rows) => {
        if (err) {
            console.error("Error check reminders:", err);
            return;
        }

        rows.forEach(r => {
            // Parse start time "10:00"
            const [h, m] = r.start_time.split(':').map(Number);

            // Calc diff in minutes
            const resDate = new Date();
            resDate.setHours(h, m, 0, 0);

            const diffMs = resDate - now;
            const diffMins = diffMs / 1000 / 60;

            // Send if it's within 60 minutes and valid (positive time)
            if (diffMins > 0 && diffMins <= 60) {
                sendReminder(r.user_email, r);

                // Mark as reminded
                db.run("UPDATE reservations SET reminded = 1 WHERE id = ?", [r.id], (err) => {
                    if (err) console.error("Error updating reminder flag", err);
                });
            }
        });
    });
}

module.exports = {
    checkUpcomingReservations
};
