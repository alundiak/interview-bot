// https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/19.custom-dialogs/bot.js
//
// In fact simplified to simple 2 dialogs - TODO - review comparing bot-complex-dialog.ts
//

const { ActivityTypes } = require('botbuilder');
const { DialogSet, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');

const { SlotFillingDialog } = require('./slotFillingDialog');
const { SlotDetails } = require('./slotDetails');
const { quizData } = require('./quiz-data');

const DIALOG_STATE_PROPERTY = 'dialogState';

export class MyBot {
    conversationState: any;
    dialogState: any;
    dialogs: any;

    /**
     * SampleBot defines the core business logic of this bot.
     * @param {ConversationState} conversationState A ConversationState object used to store dialog state.
     */
    constructor(conversationState, userState) {
        // todo use userState to store user answers, 
        // otherwise it will store/persisst in activeDialog state. not sure if it's OK.

        this.conversationState = conversationState;

        // Create a property used to store dialog state.
        // See https://aka.ms/about-bot-state-accessors to learn more about bot state and state accessors.
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        // Create a dialog set to include the dialogs used by this bot.
        this.dialogs = new DialogSet(this.dialogState);

        const jsQuizSlots = quizData.js.map(data => {
            // ideally would be great to use ONLY data.id, but then Dialog state is always one and the same.
            return new SlotDetails('js_question_' + data.id, 'choice', data.question, data.proposedAnswers, data.expectedAnswer); // AL: Approach #1
        });

        const reactQuizSlots = quizData.react.map(data => {
            return new SlotDetails('react_question_' + data.id, 'choice', data.question, data.proposedAnswers, data.expectedAnswer);
        });

        const quizSlots = [
            new SlotDetails('js', 'js'),
            new SlotDetails('react', 'react')
        ];

        this.dialogs.add(new ChoicePrompt('choice')); // we need to add it once, so that all next use it.
        this.dialogs.add(new SlotFillingDialog('js', jsQuizSlots));
        this.dialogs.add(new SlotFillingDialog('react', reactQuizSlots));
        this.dialogs.add(new SlotFillingDialog('slot-dialog', quizSlots)); // slot-quiz-dialog - TODO

        // Finally, add a 2-step WaterfallDialog that will initiate the SlotFillingDialog,
        // and then collect and display the results.
        this.dialogs.add(new WaterfallDialog('root', [
            this.startDialog.bind(this),
            this.processResults.bind(this)
        ]));
    }

    // This is the first step of the WaterfallDialog.
    // It kicks off the dialog with the multi-question SlotFillingDialog,
    // then passes the aggregated results on to the next step.
    async startDialog(step) {
        return await step.beginDialog('slot-dialog'); // TODO quiz-slot-dialog
    }

    // This is the second step of the WaterfallDialog.
    // It receives the results of the SlotFillingDialog and displays them.
    async processResults(step) {
        // Each "slot" in the SlotFillingDialog is represented by a field in step.result.values.
        // The complex that contain subfields have their own .values field containing the sub-values.

        const mainValues = step.result.values;

        const jsValues = mainValues['js'].values;
        const reactValues = mainValues['react'].values;

        // AL: Approach 1 - if I could pass exectedAnswer on SlotDetails level somehow and pass it to Dialog state
        // for (const prop in jsObj) {
        //     if (jsObj.hasOwnProperty(prop)) {
        //         const element = jsObj[prop];
        //         console.log('VALUE:', element[prop].value);
        //         console.log('EXPECTED ANSWER: ', element[prop].expectedAnswer);
        //     }
        // }
        // Approach #2

        const jsScore = this.calculateScore(jsValues, quizData.js);
        await step.context.sendActivity(`Your JavaScript test score is ${jsScore}%`);

        const reactScore = this.calculateScore(reactValues, quizData.react);
        await step.context.sendActivity(`Your ReactJS test score is ${reactScore}%`);

        await step.context.sendActivity(`TBD - logic after - cancel, re-take test, exit, bye, etc.`);

        return await step.endDialog();
    }

    /**
     * Taking answers and questions data, this helper function returns score in percentage.
     * 
     * @param {Object} answersObj 
     * @param {Array} quizDataArray 
     */
    calculateScore(answersObj: object, quizDataArray: any) {
        let correctAnswersNumber = 0;
        const totalQuestionsNumber = quizDataArray.length;

        for (const prop in answersObj) {
            if (answersObj.hasOwnProperty(prop)) {
                // agree, really weird way
                const strIndex = +prop.search(/\d+/);
                const questionIndex = +prop.substring(strIndex);
                const answerValue = answersObj[prop].value;
                const expectedAnswerValue = quizDataArray.filter(q => {
                    return q.id === questionIndex
                })[0].expectedAnswer;
                // agree, really weird way

                if (answerValue === expectedAnswerValue) {
                    ++correctAnswersNumber;
                }
            }
        }

        const score = correctAnswersNumber * 100 / totalQuestionsNumber;

        return score;
    }

    /**
     *
     * @param {TurnContext} turnContext A TurnContext object representing an incoming message to be handled by the bot.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Create dialog context.
            const dc = await this.dialogs.createContext(turnContext);

            const utterance = (turnContext.activity.text || '').trim().toLowerCase();
            if (utterance === 'cancel') {
                if (dc.activeDialog) {
                    await dc.cancelAllDialogs();
                    await dc.context.sendActivity(`Ok... canceled.`);
                } else {
                    await dc.context.sendActivity(`Nothing to cancel.`);
                }
            }

            if (!dc.context.responded) {
                // Continue the current dialog if one is pending.
                await dc.continueDialog();
            }

            if (!dc.context.responded) {
                // If no response has been sent, start the onboarding dialog.
                await dc.beginDialog('root');
            }
        } else if (
            turnContext.activity.type === ActivityTypes.ConversationUpdate &&
            turnContext.activity.membersAdded[0].name !== 'Bot'
        ) {
            // Send a "this is what the bot does" message.
            const description = [
                'This is a bot that demonstrates an alternate dialog system',
                'which uses a slot filling technique to collect multiple responses from a user.',
                'Say anything to continue.'
            ];
            await turnContext.sendActivity(description.join(' '));
        }

        await this.conversationState.saveChanges(turnContext);
    }
}