const { handleMacAddressCommand, handleSimpleCommand, handleHelpCommand } = require('./commandHandlers');
const { handleMenuCommand, handleMainMenu, isMainMenuMode, isMenuRoom, exitMenuMode } = require('./menuHandlers');
const { logger } = require('../config/config');
const { isMonitoredRoom, isAllowedUser } = require('./utils');

async function handleEvent(client, roomId, event) {
    if (!event.content || event.content.msgtype !== "m.text") {
        return;
    }

    logger.info(`Message received in room ${roomId} from ${event.sender}`);

    if (!isMonitoredRoom(roomId) || !isAllowedUser(event.sender)) {
        return;
    }

    const body = event.content.body;

    if (isMainMenuMode() && isMenuRoom(roomId)) {
        if (/^\d+$/.test(body)) {
            await handleMainMenu(client, roomId, event.sender, parseInt(body, 10));
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
