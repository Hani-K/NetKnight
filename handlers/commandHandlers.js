const { sendApiCommand } = require('../services/apiService');
const { logger } = require('../config/config');

async function handleMacAddressCommand(client, roomId, sender, body) {
    const [command, macAddress] = body.split(" ");
    if (!macAddress) {
        await client.sendText(roomId, `No MAC address provided with ${command} command.`);
        logger.warn(`No MAC address provided with ${command} command from ${sender} in room ${roomId}`);
        return;
    }

    logger.info(`Detected command ${command} with MAC ${macAddress} from ${sender} in room ${roomId}`);
    const apiCommand = command.substring(1);  // Remove the leading '#' to get the command

    try {
        const response = await sendApiCommand(apiCommand, roomId, sender, macAddress);
        await client.sendText(roomId, response);
        logger.info(response);
    } catch (error) {
        await client.sendText(roomId, error.message);
        logger.error(error.message);
    }
}

async function handleSimpleCommand(client, roomId, sender, command) {
    logger.info(`Detected ${command} command from ${sender} in room ${roomId}`);
    try {
        const response = await sendApiCommand(command, roomId, sender);
        await client.sendText(roomId, response);
        logger.info(response);
    } catch (error) {
        await client.sendText(roomId, error.message);
        logger.error(error.message);
    }
}

async function handleHelpCommand(client, roomId) {
    logger.info(`Detected #help command`);
    const helpMessage = `
    Available commands:
    - #help: Display this help message
    - #block <MAC>: Block a device with the given MAC address
    - #allow <MAC>: Allow a device with the given MAC address
    - #allowsave <MAC>: Allow and save a device with the given MAC address
    - #!DANGER: Block access of a new device to wifi network
    - #monitor_devices: Monitor connected devices
    - #monitor_traffic: Monitor network traffic
    - #!reboot: Reboot openwrt router AP1
    - #menu: Display a menu of commands to choose from
    `;
    try {
        await client.sendText(roomId, helpMessage);
        logger.info(`#help command processed in room ${roomId}`);
    } catch (error) {
        logger.error(`Failed to process #help command in room ${roomId}: ${error.message}`);
    }
}

module.exports = { handleMacAddressCommand, handleSimpleCommand, handleHelpCommand };
