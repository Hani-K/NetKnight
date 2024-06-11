const axios = require('axios');
const { config } = require('../config/config');

async function sendApiCommand(command, roomId, sender, macAddress = null) {
    const data = {
        command,
        roomId,
        userId: sender,
    };

    if (macAddress) {
        data.macAddress = macAddress;
    }

    try {
        await axios.post(config.apiWebhookUrl, data);
        return `${command.charAt(0).toUpperCase() + command.slice(1)} command ${macAddress ? `with MAC ${macAddress} ` : ''}sent to Arcturus!`;
    } catch (error) {
        throw new Error(`Failed to send ${command} command${macAddress ? ` with MAC ${macAddress}` : ''} to Arcturus.`);
    }
}

module.exports = { sendApiCommand };
