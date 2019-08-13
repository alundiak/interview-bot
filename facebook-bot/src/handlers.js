// https://quantizd.com/building-facebook-messenger-bot-with-nodejs/
// https://github.com/waleedahmad/Aww-Bot
// const uuidv1 = require('uuid/v1');
const { callSendAPI } = require('./common');
const { askTemplate, imageTemplate, attachmentTemplate } = require('./payloads');
const myGoogleApi = require('../google-api/my-drive/index.js');

// expected to contain candidate Self Evaluation via "Formularz"
// also name
// and email
const defaultCandidateData = {
    replies: {},
    phone_number: '',
    email: '',
    name: ''
};

// let candidateData = defaultCandidateData;

let userId;
const botState = {};

// let spreadSheetUpdated  = false;
// TODO - use it, but when userID used.

// const a = uuidv1();
// console.log(a);

// Built with TestBot FB page + SendPulse flow setup.
const collectDataFromMessage = (nlp, userId, text) => {
    let readyForSending = false;

    const isEmailShared = nlp && nlp.entities && !!nlp.entities.email;
    const isPhoneShared = nlp && nlp.entities && !!nlp.entities.phone_number;
    console.log('isEmailShared', isEmailShared)
    console.log('isPhoneShared', isPhoneShared)

    // so far Only one Quick Reply - like button, and as result Array[] only 0.
    if (isEmailShared) {
        const [emailObj] = nlp.entities.email;

        // just assumption for having truthy condition.
        // For example,
        // These all gives "email" type of entity, but:
        // with confidence 1
        // - landike@gmail.com, andrii.hell.master@example.come, andrii.lundiak@example.com, xyz@email.com
        // with confidence 0.93432666666667
        // - abc@example.com
        if (emailObj.confidence > 0.5) {
            // candidateData.email = text;
            botState[userId].email = text;
            readyForSending = true;
        }
    }

    if (isPhoneShared) {
        const [phoneObj] = nlp.entities.phone_number;

        // These all gives "phone_number" type of entity, but:
        // with confidence 1
        // - +380965725883
        // with confidence < 1
        // -
        if (phoneObj.confidence > 0.5) {
            botState[userId].phone_number = text;
            readyForSending = true;
        }
    }

    if (readyForSending) {
        // console.log('Candidate Data before Spreadsheet Update', candidateData);
        console.log('Candidate Data before Spreadsheet Update', botState);

        // const repliesIndexes = candidateData && Object.values(candidateData.replies);
        const repliesIndexes = botState[userId] && Object.values(botState[userId].replies);

        const areAllItemsReplied = repliesIndexes.length === 5 // VERY HARDCODE for Frontend Formularz
            && repliesIndexes.every(reply => +reply > 0); // A bit better

        if (!areAllItemsReplied) {
            console.log('NOT ALL ANSWERED - throw message to Candidate - TODO');
            // throw new Error('NOT ALL ANSWERED - throw message to Candidate - TODO');
            // Need to re-do SendPulse flow, and inject JavaScript code for verifying all answers.
        }

        if (areAllItemsReplied) {
            console.log(botState);
            // myGoogleApi.setDataFromBot(candidateData);
            myGoogleApi.setDataFromBot(botState[userId]);
            myGoogleApi.initGoogleApi(); // contains  updateSpreadSheet() call - // TODO - TEMP !!!
            // myGoogleApi.updateSpreadSheet(); // ideal case

            // kinda reset, so that next user/candidate starts from scratch
            // candidateData = defaultCandidateData;
            botState[userId] = defaultCandidateData; // kinda reset user session, but it will allow use send formularz again.

            // TODO send message via Bot, that answers received, and stored in Spreadsheet.
        }
    }
}

const collectDataFromPostBack = (title, userId) => {
    // TODO - this is VERY HARDCODE - rework to collect ONLY from dedicated key-flow "tech" or "quiz"
    // This is for the flows from SendPulse.
    const replyArray = title.split('-');
    // TODO - this is very Hardcode. Because of SendPulse format of buttons values.
    if (replyArray.length === 2) {
        // candidateData.replies[replyArray[0]] = replyArray[1];
        botState[userId].replies[replyArray[0]] = replyArray[1];
    }
    // TODO
}

const handleMessage = (sender_psid, received_message, uId) => {
    userId = uId; // from entry Webhook Event

    botState[userId] = defaultCandidateData; // default setup

    let response = { text: 'hi (c) alundiak' };

    const { text, attachments, nlp, quick_reply } = received_message;
    nlp && console.log('NLP object', JSON.stringify(nlp));
    quick_reply && console.log('QuickReply object', quick_reply);

    // if (quick_reply) {
    //     console.log('Quick Reply Handling');
    // }

    if (attachments) {
        response = attachmentTemplate(received_message);
        callSendAPI(sender_psid, response);
    } else if (text) {
        // response = askTemplate('lundiak default text'); // better, but hardcode
        // response = askTemplate(received_message.text); // not sure if good, but it was in example
        response = {
            text,
        };

        collectDataFromMessage(nlp, userId, text);

    }

    // callSendAPI(sender_psid, response); // it cause double "tech" send.
}

const handlePostBack = (sender_psid, received_postback, uId) => {
    userId = uId; // from entry Webhook Event

    botState[userId] = defaultCandidateData; // default setup

    let response;

    let { title, payload } = received_postback;

    // This is is for custom code
    if (payload === 'JS') {
        response = imageTemplate('js', sender_psid);
        callSendAPI(sender_psid, response, function () {
            callSendAPI(sender_psid, askTemplate('Show me more (js)'));
        });
    } else if (payload === 'TS') {
        response = imageTemplate('ts', sender_psid);
        callSendAPI(sender_psid, response, function () {
            callSendAPI(sender_psid, askTemplate('Show me more (ts)'));
        });
    } else if (payload === 'GET_STARTED') {
        botState[userId] = defaultCandidateData; // default setup

        // response = askTemplate('Do you prefer JavaScript or TypeScript?');
        // callSendAPI(sender_psid, response);
    }

    collectDataFromPostBack(title, userId);
}

module.exports = {
    handleMessage,
    handlePostBack
}