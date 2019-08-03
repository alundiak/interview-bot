// https://quantizd.com/building-facebook-messenger-bot-with-nodejs/
// https://github.com/waleedahmad/Aww-Bot

const { callSendAPI } = require('./common');
const { askTemplate, imageTemplate, attachmentTemplate } = require('./payloads');
const myGoogleApi = require('../google-api/my-drive/index.js');

// expected to contain candidate Self Evaluation via "Formularz"
// also name
// and email
const defaultCandidateData = {
    replies: {},
    email: '',
    name: ''
};

let candidateData = defaultCandidateData;

// let spreadSheetUpdated  = false;
// TODO - use it, but when userID used.

myGoogleApi.initGoogleApi();

const handleMessage = (sender_psid, received_message) => {
    let response = { text: 'hi (c) alundiak' };

    const { text, attachments, nlp, quick_reply } = received_message;
    nlp && console.log('NLP object', nlp.entities);
    quick_reply && console.log('QuickReply object', quick_reply);

    if (attachments) {
        response = attachmentTemplate(received_message);
    } else if (text) {
        // response = askTemplate('lundiak default text'); // better, but hardcode
        // response = askTemplate(received_message.text); // not sure if good, but it was in example
        response = {
            text,
        };

        const isEmailVerified = nlp && nlp.entities && !!nlp.entities.email;

        // so far Only one Quick Reply - like button, and as result Array[] only 0.
        if (isEmailVerified) {
            console.log('Candidate Data before Spreadsheet Update', candidateData);

            const [emailObj] = nlp.entities.email

            const repliesIndexes = candidateData && Object.values(candidateData.replies);

            const areAllItemsReplied = repliesIndexes.length === 5 // VERY HARDCODE for Frontend Formularz
                && repliesIndexes.every(reply => +reply > 0); // A bit better

            if (!areAllItemsReplied){
                console.log('NOT ALL ANSWERED - throw message to Candidate - TODO');
                // Need to re-do SendPulse flow, and inject JavaScript code for verifying all answers.
            }

            // just assumption for having truthy condition.
            // For example, these all gives "email" type of entity, but:
            // with confidence 1
            // - landike@gmail.com, andrii.hell.master@example.come, andrii.lundiak@example.com, xyz@email.com
            // with confidence 0.93432666666667
            // - abc@example.com
            // TODO
            if (areAllItemsReplied && emailObj.confidence > 0.5) {
                candidateData.email = text;
                myGoogleApi.setDataFromBot(candidateData);
                myGoogleApi.updateSpreadSheet();

                // kinda reset, so that next user/candidate starts from scratch
                candidateData = defaultCandidateData;
            }
        }
    }

    callSendAPI(sender_psid, response);
}

const handlePostBack_ = (sender_psid, received_postback) => {
    let payload = received_postback.payload;
    let response;

    // if (payload === 'JS') {
    //     response = { "text": "OK. Let's dive into JavaScript quiz" }
    // } else if (payload === 'TS') {
    //     response = { "text": "OK. Let's dive into TypeScript quiz." }
    // } else if (payload === 'REACT') {
    //     response = { "text": "OK. Let's dive into React quiz" }
    // } else if (payload === 'GET_STARTED') {
    //     response = askTemplate('Please select main technology?');
    // }

    callSendAPI(sender_psid, response);
}

const handlePostBack = (sender_psid, received_postback) => {
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
        response = askTemplate('Do you prefer JavaScript or TypeScript?');
        callSendAPI(sender_psid, response);
    }

    // This is for the flows from SendPulse.
    const replyArray = title.split('-');
    // TODO - this is very Hardcode. Because of SendPulse format of buttons values.
    if (replyArray.length === 2) {
        candidateData.replies[replyArray[0]] = replyArray[1];
    }
    // TODO
}

module.exports = {
    handleMessage,
    handlePostBack
}