// MAYBE use QnA Maker?
// https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-qna?view=azure-bot-service-4.0&tabs=cs

// Below code
// taken from https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/08.suggested-actions/bot.js
const { ActivityTypes, MessageFactory } = require('botbuilder');

// const { quizData } = require('./quiz-data');

/**
 * A bot that responds to input from suggested actions.
 */
export class SuggestedActionsBot {
    /**
     * Every conversation turn for our SuggestedActionsbot will call this method.
     * There are no dialogs used, since it's "single turn" processing, meaning a single request and
     * response, with no stateful conversation.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async onTurn(turnContext) {
      //
      // https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/51.cafe-bot/bot.js
      // SWICTH example

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const text = turnContext.activity.text;
            const validColors = ['Red', 'Blue', 'Yellow'];

            if (text) {
              // if (validColors.includes(text)) { // TODO - doesn't work with TypeScript / tslint /eslint ???
              if (validColors.indexOf(text) > -1){
                await turnContext.sendActivity(`Great, ${ text } is the correct answer.`);
              } else {
                await turnContext.sendActivity(`Oops. ${ text } is wrong answer`);
              }
            } else {
              await turnContext.sendActivity('Please provide an answer.');
            }

            // After the bot has responded send the suggested actions.
            await this.sendSuggestedActions(turnContext);
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            await this.sendWelcomeMessage(turnContext);
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected.]`);
        }
    }

    /**
     * Send a welcome message along with suggested actions for the user to click.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async sendWelcomeMessage(turnContext) {
        const activity = turnContext.activity;
        if (activity.membersAdded) {
            // Iterate over all new members added to the conversation.
            for (const idx in activity.membersAdded) {
                if (activity.membersAdded[idx].id !== activity.recipient.id) {
                    const welcomeMessage = `Hello, ${ activity.membersAdded[idx].name }. ` +
                        `This is InterviewBot - a Quiz-like bot. ` +
                        `Please select an option:`;
                    await turnContext.sendActivity(welcomeMessage);
                    await this.sendSuggestedActions(turnContext); // Rework into "Start a ${type} quiz"
                }
            }
        }
    }

    /**
     * Send suggested actions to the user.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['Red', 'Yellow', 'Blue'], 'Question 1');
        await turnContext.sendActivity(reply);
    }

    // Welcome Cafe Bot example
    // https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/51.cafe-bot/bot.js
    // or here:
    // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-send-welcome-message?view=azure-bot-service-4.0&tabs=js%2Ccsharpmulti%2Ccsharpwelcomeback
}
