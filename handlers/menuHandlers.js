const { handleHelpCommand, handleSimpleCommand } = require('./commandHandlers');
const { isAllowedUser } = require('./utils');
const { logger } = require('../config/config');

let menuMode = false; // Flag to track menu mode
let menuRoomId = null; // Room ID where the menu is active

async function handleMenuCommand(client, roomId) {
    logger.info(`Detected #menu command`);
    const menuMessage = `
    Choose a command:
    1. Help
    2. Monitor Devices
    3. Monitor Traffic
    4. Danger
    5. Reboot
    0. Exit
    `;
    try {
        await client.sendText(roomId, menuMessage);
        menuMode = true;
        menuRoomId = roomId;
        logger.info(`#menu sent in room ${roomId}`);
    } catch (error) {
        logger.error(`Failed to send #menu in room ${roomId}: ${error.message}`);
    }
}

async function handleMenuSelection(client, roomId, sender, selection) {
    if (!isAllowedUser(sender)) {
        return;
    }

    switch (selection) {
        case 1:
            await handleHelpCommand(client, roomId);
            break;
        case 2:
            await handleSimpleCommand(client, roomId, sender, "monitor_devices");
            break;
        case 3:
            await handleSimpleCommand(client, roomId, sender, "monitor_traffic");
            break;
        case 4:
            await handleSimpleCommand(client, roomId, sender, "DANGER");
            break;
        case 5:
            await handleSimpleCommand(client, roomId, sender, "reboot");
            break;
        case 0:
            await client.sendText(roomId, "Exiting menu.");
            menuMode = false;
            menuRoomId = null;
            logger.info(`Menu exited by ${sender} in room ${roomId}`);
            break;
        default:
            await client.sendText(roomId, "Invalid selection. Please enter a number from 0 to 5.");
            logger.warn(`Invalid menu selection by ${sender} in room ${roomId}: ${selection}`);
    }

    if (selection >= 0 && selection <= 5) {
        menuMode = false; // Exit menu mode after handling a valid selection
        menuRoomId = null;
    }
}

function isMenuMode() {
    return menuMode;
}

function isMenuRoom(roomId) {
    return roomId === menuRoomId;
}

function exitMenuMode() {
    menuMode = false;
    menuRoomId = null;
}

module.exports = { handleMenuCommand, handleMenuSelection, isMenuMode, isMenuRoom, exitMenuMode };
