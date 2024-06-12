const { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin } = require("matrix-bot-sdk");
const { handleEvent } = require('./handlers/eventHandlers');
const { logger, config } = require('./config/config');

const storage = new SimpleFsStorageProvider("netknight.json");
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storage);

AutojoinRoomsMixin.setupOnClient(client);

const startTime = new Date();
logger.info('NetKnight started...');

client.on("room.message", async (roomId, event) => {
    await handleEvent(client, roomId, event, startTime);
});

client.start()
    .then(() => logger.info("NetKnight started!"))
    .catch(error => logger.error(`NetKnight failed to start: ${error.message}`));

// Graceful shutdown
function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    try {
        // Perform any necessary cleanup here
        client.stop(); // Attempt to stop the client if it has a stop method
        logger.info('NetKnight bot stopped.');
    } catch (error) {
        logger.error(`Error during shutdown: ${error.message}`);
    } finally {
        process.exit(0);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));