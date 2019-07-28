// https://quantizd.com/building-facebook-messenger-bot-with-nodejs/
// https://github.com/waleedahmad/Aww-Bot

const { callSendAPI } = require('./common');
const { askTemplate, imageTemplate, attachmentTemplate } = require('./payloads');

const handleMessage = (sender_psid, received_message) => {
    let response;

    const { text, attachments, nlp } = received_message;
    console.log('NLP object', nlp.entities);

    if (attachments) {
        response = attachmentTemplate(received_message);
    } else if (text) {
        // response = askTemplate(); // not good
        response = askTemplate('dunno'); // better, but hardcode
        // response = askTemplate(received_message.text); // not sure if good, but it was in example

        // response = imageTemplate('js', sender_psid);
        // callSendAPI(sender_psid, response, function () {
        //     callSendAPI(sender_psid, askTemplate('Show me more (js)'));
        // });
    }

    // response = askTemplate('Do you prefer JavaScript or TypeScript?');

    callSendAPI(sender_psid, response);
}

const handlePostBack = (sender_psid, received_postback) => {
    console.log('handlePostBack');
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    console.log('received_postback', received_postback);

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
    } else if (payload === 'GET_STARTED') { // doesn't work !!!
        response = askTemplate('Do you prefer JavaScript or TypeScript?');
        callSendAPI(sender_psid, response);
    }
}

module.exports = {
    handleMessage,
    handlePostBack
}