const { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin } = require("matrix-bot-sdk");
const { handleEvent } = require('./handlers/eventHandlers');
const { logger, config } = require('./config/config');

const storage = new SimpleFsStorageProvider("netknight.json");
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storage);

AutojoinRoomsMixin.setupOnClient(client);

logger.info('NetKnight started...');

client.on("room.message", async (roomId, event) => {
    await handleEvent(client, roomId, event);
});

client.start()
    .then(() => logger.info("NetKnight started!"))
    .catch(error => logger.error(`NetKnight failed to start: ${error.message}`));
