const { handleMacAddressCommand } = require('./commandHandlers');
const { logger, config } = require('../config/config');

let macMenuMode = false; // Flag to track mac menu mode
let macMenuRoomId = null; // Room ID where the mac menu is active
let currentMacAddress = null; // Current MAC address being handled

async function botEventHandler(client, roomId, event) {
    if (!event.content || event.content.msgtype !== "m.text") {
        return;
    }

    const sender = event.sender;

    if (!config.allowedBots.includes(sender)) {
        return;
    }

    // Log the entire event content for debugging
    // logger.info(`Received bot event: ${JSON.stringify(event)}`);

    const body = event.content.formatted_body || event.content.body;

    // Log the received message for debugging
    logger.info(`Received bot message: ${body}`);

    // Check for device MAC phrase
    const match = body.match(/(\S+) has connected to (\S+)/);
    if (match) {
        const device = match[1];
        const interface = match[2];

        if (isMacAddress(device)) {
            await handleMacMenu(client, roomId, device);
        } else {
            logger.info(`Device ${device} connected to ${interface}. No further actions needed.`);
        }
    }
}

function isMacAddress(device) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(device);
}

async function handleMacMenu(client, roomId, macAddress) {
    logger.info(`Detected MAC address ${macAddress} for macMenu.`);
    const menuMessage = `
    Choose a command for ${macAddress}:
    1. Block ${macAddress}
    2. Allow ${macAddress}
    3. Allow and Save ${macAddress}
    0. Exit
    `;
    try {
        await client.sendText(roomId, menuMessage);
        macMenuMode = true;
        macMenuRoomId = roomId;
        currentMacAddress = macAddress;
        logger.info(`macMenu is activated in room ${roomId} for ${macAddress}`);
    } catch (error) {
        logger.error(`Failed to activate macMenu in room ${roomId} for ${macAddress}: ${error.message}`);
    }
}

async function handleMacMenuSelection(client, roomId, sender, selection) {
    if (!config.allowedUsers.includes(sender)) {
        return;
    }

    if (!macMenuMode || roomId !== macMenuRoomId) {
        return;
    }

    switch (selection) {
        case 1:
            await handleMacAddressCommand(client, roomId, sender, `#block ${currentMacAddress}`);
            break;
        case 2:
            await handleMacAddressCommand(client, roomId, sender, `#allow ${currentMacAddress}`);
            break;
        case 3:
            await handleMacAddressCommand(client, roomId, sender, `#allowsave ${currentMacAddress}`);
            break;
        case 0:
            await client.sendText(roomId, "No action is taken.");
            macMenuMode = false;
            macMenuRoomId = null;
            currentMacAddress = null;
            logger.info(`macMenu exited by ${sender} in room ${roomId}`);
            break;
        default:
            await client.sendText(roomId, "Invalid selection. Please enter a number from 0 to 3.");
            logger.warn(`Invalid mac menu selection by ${sender} in room ${roomId}: ${selection}`);
    }

    // Exit mac menu mode after handling a valid selection
    if (selection >= 0 && selection <= 3) {
        macMenuMode = false; 
        macMenuRoomId = null;
        currentMacAddress = null;
    }
}

function isMacMenuMode() {
    return macMenuMode;
}

function isMacMenuRoom(roomId) {
    return roomId === macMenuRoomId;
}

module.exports = { botEventHandler, handleMacMenuSelection, isMacMenuMode, isMacMenuRoom };
