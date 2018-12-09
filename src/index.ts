import * as restify from 'restify';
import * as path from 'path';
import { config } from 'dotenv';
import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } from 'botbuilder';
import { BotConfiguration, IEndpointService } from 'botframework-config';
// import { MyBot } from './bot';
import { SuggestedActionsBot } from './bot-suggested-actions';
const ENV_FILE = path.join(__dirname, '..', '.env');
const env = config({ path: ENV_FILE });
const DEV_ENVIRONMENT = 'development';
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open IV-bot.bot file in the Emulator.`);
});

const BOT_FILE = path.join(__dirname, '..', (process.env.botFilePath || ''));

let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.\n\n`);
    process.exit();
}

const endpointConfig = <IEndpointService>botConfig.findServiceByNameOrId(BOT_CONFIGURATION);
const adapterConfig = {
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
};
// console.log(a);
const adapter = new BotFrameworkAdapter(adapterConfig);

const memoryStorage = new MemoryStorage();
// CAUTION: You must ensure your product environment has the NODE_ENV set
//          to use the Azure Blob storage or Azure Cosmos DB providers.
// const { BlobStorage } = require('botbuilder-azure');
// Storage configuration name or ID from .bot file
// const STORAGE_CONFIGURATION_ID = '<STORAGE-NAME-OR-ID-FROM-BOT-FILE>';
// // Default container name
// const DEFAULT_BOT_CONTAINER = '<DEFAULT-CONTAINER>';
// // Get service configuration
// const blobStorageConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION_ID);
// const blobStorage = new BlobStorage({
//     containerName: (blobStorageConfig.container || DEFAULT_BOT_CONTAINER),
//     storageAccountOrConnectionString: blobStorageConfig.connectionString,
// });
// conversationState = new ConversationState(blobStorage);

const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// const myBot = new MyBot(conversationState);
const myBot = new SuggestedActionsBot(conversationState, userState);

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.load(context);
    await conversationState.clear(context);
    // Save state changes.
    await conversationState.saveChanges(context);
};

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await myBot.onTurn(context);
    });
});

