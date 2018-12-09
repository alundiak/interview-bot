// Below code taken from 
// https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/08.suggested-actions/bot.js
const { ActivityTypes, MessageFactory } = require('botbuilder');

const { quizData } = require('./quiz-data');
// console.log(quizData);

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

let useAttachment = false;

/**
 * A bot that responds to input from suggested actions.
 */
export class SuggestedActionsBot {
    private conversationData;
    private conversationState;
    private userState;
    private userProfile;

    /**
     *
     * @param {ConversationState} conversation state object
     * @param {UserState} user state object
     */
    constructor(conversationState, userState) {
        if (!conversationState) throw new Error('Missing parameter. conversationState is required');
        if (!userState) throw new Error('Missing parameter. userState is required');
        // if (!botConfig) throw new Error('Missing parameter.  botConfig is required');

        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.conversationState = conversationState;
        this.userState = userState;
        this.conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
    }

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

        switch (turnContext.activity.type) {

            case ActivityTypes.Message:

                const userProfile = await this.userProfile.get(turnContext, {});
                const conversationData = await this.conversationData.get(turnContext, {
                    promptedForUserName: false,
                    promptedForQuizType: false,
                    promptedToConfirmInteruption: false // if user finish quiz. TODO
                });

                // Majority of code/approach taken from here:
                // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-v4-state?view=azure-bot-service-4.0&tabs=javascript
                // But there is adavanced way for sequential approach:
                // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-dialog-manage-conversation-flow?view=azure-bot-service-4.0&tabs=javascript

                if (!userProfile.name) {

                    if (conversationData.promptedForUserName) {
                        userProfile.name = turnContext.activity.text; // WARNING: CAN BE ANYTHING. TODO Name Validation
                        await turnContext.sendActivity(`Thanks ${userProfile.name}.`);
                        conversationData.promptedForUserName = false;

                        await this.sendSuggestedQuizTypes(turnContext);
                    } else {
                        await turnContext.sendActivity('What is your name? (I need for quiz statistics)');
                        conversationData.promptedForUserName = true;
                    }

                } else if (!userProfile.quizType) {

                    if (conversationData.promptedForQuizType) {
                        userProfile.quizType = turnContext.activity.text; // Assuming, user will answer for Suggested Actions.
                        // await turnContext.sendActivity(`'${userProfile.quizType}' selected. Now questions...`);
                        // conversationData.promptedForQuizType = false;

                        // if we have name, and quizType (userProfile.quizType), we start a quiz.
                        await this.startQuiz(turnContext, userProfile);
                    } else {

                        conversationData.promptedForQuizType = true;
                    }

                } else {

                    // Add message details to the conversation data.
                    conversationData.timestamp = turnContext.activity.timestamp.toLocaleString();
                    conversationData.channelId = turnContext.activity.channelId;


                }

                // Update conversation state and save changes.
                await this.conversationData.set(turnContext, conversationData);
                await this.conversationState.saveChanges(turnContext);

                // Save user state and save changes.
                await this.userProfile.set(turnContext, userProfile);
                await this.userState.saveChanges(turnContext);

                break;

            case ActivityTypes.ConversationUpdate:
                await this.sendWelcomeMessage(turnContext);
                break;

            default:
                await turnContext.sendActivity(`[${turnContext.activity.type} event detected.]`);
                break;
        }

        // from https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/51.cafe-bot/bot.js
        // Persist state.
        // Hint: You can get around explicitly persisting state by using the autoStateSave middleware.
        await this.conversationState.saveChanges(turnContext);
        await this.userState.saveChanges(turnContext);
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
                    const welcomeMessage = `Hello, ${activity.membersAdded[idx].name}. This is InterviewBot - a Quiz-like bot. `;

                    await turnContext.sendActivity(welcomeMessage);
                }
            }
        }
    }

    async sendSuggestedQuizTypes(turnContext) {
        const reply = MessageFactory.suggestedActions(['js', 'react'], 'Please select quiz type?');
        return await turnContext.sendActivity(reply);
    }

    /**
     * Send suggested actions to the user.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async sendQuestions(turnContext) {
        const reply = MessageFactory.suggestedActions(['Red', 'Yellow', 'Blue'], 'Question 1');
        return await turnContext.sendActivity(reply);
    }

    async startQuiz(turnContext, userProfile) {
        // const text = turnContext.activity.text;
        const text = userProfile.quizType;
        switch (text) {
            case 'js':
                this.runJSQuiz(turnContext);
                break;

            case 'react':
                this.runReactQuiz(turnContext);
                break;

            default:
                console.log('answer: ', text);
                // TODO
                break;
        }
    }

    async runJSQuiz(turnContext) {
        
        await this.sendQuestions(turnContext);

        const text = turnContext.activity.text;
        // const validColors = ['Red', 'Blue', 'Yellow']; // for multiple correct answers
        const validColors = ['Blue'];

        if (text) {
            // if (validColors.includes(text)) { // TODO - doesn't work with TypeScript / tslint /eslint ???
            if (validColors.indexOf(text) > -1) {
                await turnContext.sendActivity(`Great, '${text}' is the correct answer.`);
                // then save answer in state and move on to next question
            } else {
                await turnContext.sendActivity(`Oops. '${text}' is wrong answer`);
            }
        } else {
            await turnContext.sendActivity('Please provide an answer.');
        }
    }

    async runReactQuiz(turnContext) {

    }

    /* function getInternetAttachment - Returns an attachment to be sent to the user from a HTTPS URL */
    getInternetAttachment() {
        return {
            name: 'datatypes',
            contentType: 'image/png',
            // contentUrl: './images/quiz-js/datatypes-300x300.png' // doesn't work
            // contentUrl: 'http://localhost:3978/images/quiz-js/datatypes-300x300.png' // doesn't work
            contentUrl: 'http://tensor-programming.com/wp-content/uploads/2016/09/datatypes-300x300.png'
        }
    }

    async userLogic() {

    }

    async quizTypeLogic() {

    }

    async mainQuizLogic() {

    }

    async attachmentsLogic(turnContext) {
        if (useAttachment) {
            // more
            // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-media-attachments?view=azure-bot-service-4.0&tabs=javascript
            let reply = {
                attachments: [this.getInternetAttachment()],
                text: 'Question in form of image.'
            }
            await turnContext.sendActivity(reply);
        }
    }

    // Welcome Cafe Bot example
    // https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/51.cafe-bot/bot.js
    // or here:
    // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-send-welcome-message?view=azure-bot-service-4.0&tabs=js%2Ccsharpmulti%2Ccsharpwelcomeback
}
