const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../server_logs.log');

function log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    // Console output
    console.log(logEntry.trim());

    // File output
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

module.exports = {
    info: (msg) => log('info', msg),
    error: (msg) => log('error', msg),
    warn: (msg) => log('warn', msg)
};
