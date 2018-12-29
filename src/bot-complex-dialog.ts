// https://github.com/Microsoft/BotFramework-Samples/blob/master/SDKV4-Samples/js/complexDialogBot/bot.js
const { ActivityTypes } = require('botbuilder');
const { DialogSet, WaterfallDialog, TextPrompt, ChoicePrompt, DialogTurnStatus } = require('botbuilder-dialogs');

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

const WELCOME_TEXT =
    'Welcome to InterviewBot. This bot provides a complex conversation, with multiple dialogs, '
    + 'helps you to take different frontend related quizes. '
    + 'Type anything to get started.';

// Define the dialog and prompt names for the bot.
const TOP_LEVEL_DIALOG = 'dialog-topLevel';
const QUIZ_RESULTS_DIALOG = 'dialog-quizResults';
const NAME_PROMPT = 'prompt-name';
const SELECTION_PROMPT = 'prompt-quizSelection';

// Define a 'done' response for the quiz selection prompt.
const DONE_OPTION = 'done';

// Define value names for values tracked inside the dialogs.
const USER_INFO = 'value-userInfo';
const SELECTED_QUIZ = 'value-selectedQuiz';

// Define the quiz choices for the quiz selection prompt.
const QUIZ_OPTIONS = [
    'JavaScript', 'React', 'TypeScript', 'Angular'
];

/**
 * Complex Dialog Bot
 */
export class MyBot {
    dialogStateAccessor: any;
    userProfileAccessor: any;
    conversationState: any;
    userState: any;
    dialogs: any;
    /**
     *
     * @param {ConversationState} conversation state object
     * @param {UserState} user state object
     */
    constructor(conversationState, userState) {
        // Create the state property accessors and save the state management objects.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;

        // Create a dialog set for the bot. It requires a DialogState accessor, with which
        // to retrieve the dialog state from the turn context.
        this.dialogs = new DialogSet(this.dialogStateAccessor);

        // Add the prompts we need to the dialog set.
        this.dialogs
            .add(new TextPrompt(NAME_PROMPT))
            .add(new ChoicePrompt(SELECTION_PROMPT));

        // Add the dialogs we need to the dialog set.
        this.dialogs.add(new WaterfallDialog(TOP_LEVEL_DIALOG)
            .addStep(this.nameStep.bind(this))
            .addStep(this.startSelectionStep.bind(this))
            .addStep(this.acknowledgementStep.bind(this))
        );

        this.dialogs.add(new WaterfallDialog(QUIZ_RESULTS_DIALOG)
            .addStep(this.selectionStep.bind(this))
            // .addStep(this.loopStep.bind(this))
            // .addStep(this.mainQuizBodyStep.bind(this))
        );
    }

    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Run the DialogSet - let the framework identify the current state of the dialog from
            // the dialog stack and figure out what (if any) is the active dialog.
            const dialogContext = await this.dialogs.createContext(turnContext);
            const results = await dialogContext.continueDialog();
            
            console.log('onTurn status', results.status);
            
            switch (results.status) {
                case DialogTurnStatus.cancelled:
                case DialogTurnStatus.empty:
                    // If there is no active dialog, we should clear the user info and start a new dialog.
                    await this.userProfileAccessor.set(turnContext, {});
                    await this.userState.saveChanges(turnContext);
                    await dialogContext.beginDialog(TOP_LEVEL_DIALOG);
                    break;
                case DialogTurnStatus.complete:
                    // If we just finished the dialog, capture and display the results.
                    const userInfo = results.result;
                    const status = this.getQuizResultsStatus(results);
                    await turnContext.sendActivity(status);
                    await this.userProfileAccessor.set(turnContext, userInfo);
                    await this.userState.saveChanges(turnContext);
                    break;
                case DialogTurnStatus.waiting:
                    // If there is an active dialog, we don't need to do anything here.
                    break;
            }
            await this.conversationState.saveChanges(turnContext);
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            if (turnContext.activity.membersAdded && turnContext.activity.membersAdded.length > 0) {
                await this.sendWelcomeMessage(turnContext);
            }
        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
        }
    }

    getQuizResultsStatus(results: any): string {
        // console.log(results);
        const { value, index, score, synonym, resultScore, maxScore } = results.result.quizList;
        const status = `Your result for **${value}** quiz is ${resultScore} from ${maxScore}.`;
        const scoreStatus = {
            PASSED: 'Passed',
            NOTPASSED: 'Not Passed'
        };
        // IF - score system, based on quiz.data.json
        return status;
    }

    // Sends a welcome message to any users who joined the conversation.
    async sendWelcomeMessage(turnContext) {
        for (var idx in turnContext.activity.membersAdded) {
            if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                await turnContext.sendActivity(WELCOME_TEXT);
            }
        }
    }

    async nameStep(stepContext) {
        // Create an object in which to collect the user's information within the dialog.
        stepContext.values[USER_INFO] = {};

        // Ask the user to enter their name.
        return await stepContext.prompt(NAME_PROMPT, 'Please enter your name.');
    }

    async startSelectionStep(stepContext) {
        // Set the user's name to what they entered in response to the name prompt.
        stepContext.values[USER_INFO].name = stepContext.result;

        // if (stepContext.result < 25) {
        //     // If they are too young, skip the review selection dialog, and pass an empty list to the next step.
        //     await stepContext.context.sendActivity('You must be 25 or older to participate.');
        //     return await stepContext.next([]);
        // } else {
        // Otherwise, start the review selection dialog.
        return await stepContext.beginDialog(QUIZ_RESULTS_DIALOG);
        // }
    }

    async acknowledgementStep(stepContext) {
        // console.log(stepContext);
        
        // Set the user's quiz selection to what they entered in the review-selection dialog.
        const list = stepContext.result || [];
        stepContext.values[USER_INFO].quizList = list;
        stepContext.values[USER_INFO].quizResults = {a: 123, b: 456};

        await stepContext.context.sendActivity(`${stepContext.values[USER_INFO].name}, Quiz ${list.value} starts now!`);

        // Exit the dialog, returning the collected user information.
        return await stepContext.endDialog(stepContext.values[USER_INFO]);
    }

    async selectionStep(stepContext) {
        console.log('selectionStep stepContext.values', stepContext.values);
        
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[SELECTED_QUIZ] = list;

        console.log('selectionStep - list', list);

        // Create a prompt message.
        let message;
        if (list.length === 0) {
            // message = 'Please choose a quiz type, or `' + DONE_OPTION + '` to finish.';
            message = 'Please choose a quiz type.';
        } else {
            // message = `You have selected **${list[0]}**. ` + 'Or choose `' + DONE_OPTION + '` to finish.';
            message = `You have selected **${list[0]}**.`;
        }

        // Create the list of options to choose from.
        const options = list.length > 0
            ? QUIZ_OPTIONS.filter(function (item) { return item !== list[0] })
            : QUIZ_OPTIONS.slice();

        // options.push(DONE_OPTION);

        console.log('selectionStep - options', options);

        // Prompt the user for a choice.
        return await stepContext.prompt(SELECTION_PROMPT, {
            prompt: message,
            retryPrompt: 'Please choose a quiz type from the list.',
            choices: options
        });
    }

    async loopStep(stepContext) {
        console.log('loop', stepContext.values[SELECTED_QUIZ]);

        // Retrieve their selection list, the choice they made, and whether they chose to finish.
        const list = stepContext.values[SELECTED_QUIZ];
        console.log('LOOP LIST', list);
        
        const choice = stepContext.result;
        const done = choice.value === DONE_OPTION;

        console.log(choice.value); // JavaScript | React
        
        if (!done) {
            // If they chose a quiz, add it to the list.
            list.push(choice.value);
        }

        if (done ||  list.length > 1) {
            // If they're done, exit and return their list.
            return await stepContext.endDialog(list);
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            // return await stepContext.replaceDialog(QUIZ_RESULTS_DIALOG, list);
            // USE QUIZ BODY HERE as next step
        }
    }


    async mainQuizBody(stepContext) {
        return await console.log('mainQuizBodyStep');
        // MAIN QUIZ BODY LOGIC - Slots?

    }
}