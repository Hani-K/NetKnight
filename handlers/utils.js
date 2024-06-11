const { config } = require('../config/config');
const { logger } = require('../config/config');

function isMonitoredRoom(roomId) {
    const isMonitored = config.monitoredRooms.includes(roomId);
    if (!isMonitored) {
        logger.info(`Ignored message from unmonitored room ${roomId}`);
    }
    return isMonitored;
}

function isAllowedUser(sender) {
    const isAllowed = config.allowedUsers.includes(sender);
    if (!isAllowed) {
        logger.info(`Ignored message from unauthorized user ${sender}`);
    }
    return isAllowed;
}

module.exports = { isMonitoredRoom, isAllowedUser };
