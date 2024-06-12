const { handleMacAddressCommand, handleSimpleCommand, handleHelpCommand } = require('./commandHandlers');
const { handleMenuCommand, handleMainMenu, isMainMenuMode, isMenuRoom, exitMenuMode } = require('./menuHandlers');
const { botEventHandler, handleMacMenuSelection, isMacMenuMode, isMacMenuRoom } = require('./botEventHandler');
const { logger, config } = require('../config/config');
const { isMonitoredRoom, isAllowedUser } = require('./utils');

async function handleEvent(client, roomId, event, startTime) {
    if (!event.content || event.content.msgtype !== "m.text") {
        return;
    }

    const eventTimestamp = new Date(event.origin_server_ts);
    if (eventTimestamp < startTime) {
        // Ignore messages sent before the bot started
        logger.info(`Ignored old message from ${event.sender} in room ${roomId}`);
        return;
    }

    logger.info(`Message received in room ${roomId} from ${event.sender}`);

    // Log the entire event content for debugging
    // logger.info(`Received bot event: ${JSON.stringify(event)}`);

    // Check if the sender is an allowed bot
    if (config.allowedBots.includes(event.sender)) {
        await botEventHandler(client, roomId, event);
        return;
    }

    if (!isMonitoredRoom(roomId) || !isAllowedUser(event.sender)) {
        return;
    }

    const body = event.content.body;

    if (isMainMenuMode() && isMenuRoom(roomId)) {
        if (/^\d+$/.test(body)) {
            await handleMainMenu(client, roomId, event.sender, parseInt(body, 10));
        }
    } else if (isMacMenuMode() && isMacMenuRoom(roomId)) {
        if (/^\d+$/.test(body)) {
            await handleMacMenuSelection(client, roomId, event.sender, parseInt(body, 10));
        }
    } else {
        if (body.startsWith("#block") || body.startsWith("#allow") || body.startsWith("#allowsave")) {
            await handleMacAddressCommand(client, roomId, event.sender, body);
        } else if (body === "#!DANGER") {
            await handleSimpleCommand(client, roomId, event.sender, "DANGER");
        } else if (body === "#help") {
            await handleHelpCommand(client, roomId);
        } else if (body === "#menu") {
            await handleMenuCommand(client, roomId);
        } else if (body === "#monitor_devices") {
            await handleSimpleCommand(client, roomId, event.sender, "monitor_devices");
        } else if (body === "#monitor_traffic") {
            await handleSimpleCommand(client, roomId, event.sender, "monitor_traffic");
        } else if (body === "#!reboot") {
            await handleSimpleCommand(client, roomId, event.sender, "reboot");
        }
    }
}

module.exports = { handleEvent };
