// Sprint 3: Mock Reminder System
// In a real app, this would use nodemailer and be scheduled with node-cron

function sendReminder(email, reservationDetails) {
    console.log(`[REMINDER SYSTEM] Sending email to ${email}`);
    console.log(`[CONTENT] Recordatorio: Tienes una reserva hoy en ${reservationDetails.room} de ${reservationDetails.start} a ${reservationDetails.end}`);
}

// Example usage to simulate check
function checkUpcomingReservations(db) {
    console.log('[REMINDER SYSTEM] Checking for upcoming reservations...');
    // Mock check
    // db.all("SELECT ... WHERE date = today AND start_time close to now ...")
}

module.exports = {
    sendReminder,
    checkUpcomingReservations
};
