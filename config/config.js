const winston = require("winston");
require('dotenv').config();

const config = {
    homeserverUrl: process.env.MATRIX_HOMESERVER_URL,
    accessToken: process.env.MATRIX_ACCESS_TOKEN,
    apiWebhookUrl: process.env.API_WEBHOOK_URL,
    allowedUsers: process.env.ALLOWED_USERS.split(','), // Split into array
    monitoredRooms: process.env.MONITORED_ROOMS.split(','), // Split into array
    allowedBots: process.env.ALLOWED_BOTS.split(','), // Split into array
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'log_netknight.log' })
    ]
});

module.exports = { config, logger };
