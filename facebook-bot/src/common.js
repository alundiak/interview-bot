//
// Expected to be file for common code, mainly API related,
//
const request = require('request');

// via IV-Bot FB APP + TestBot FB page
// const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

// via sms2chat FB APP + Moya Ukr Kompaniya FB page
// const accessToken = process.env.SMS2CHAT_FB_APP_ACCESS_TOKEN;
const accessToken = '';

const baseURI = 'https://graph.facebook.com/v4.0/';

/**
 * @description Sends response messages via the Send API to the Messenger Platform.
 *
 * @param {string} sender_psid
 * @param {object} response - in fact it's payloadMessage
 * @param {function} cb
 */
const callSendAPI = (sender_psid, response, cb = null) => {
    console.log('callSendAPI call', JSON.stringify(response));

    const request_body = {
        // https://blog.pusher.com/facebook-chatbot-dialogflow/
        // "messaging_type": 'RESPONSE', // didn't help. Issue was with event "messaging_postbacks"
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    const options = {
        "method": "POST",
        "uri": baseURI + "me/messages",
        "qs": { "access_token": accessToken },
        "json": request_body
    };

    // console.log(JSON.stringify(request_body));
    // console.log(options);

    request(options, (err, res, body) => {
        // console.log(err) // null
        // console.log(body) // exist
        if (!err) {
            if (body.error) {
                console.error("Error in body", body.error);
            }
            if (cb) {
                cb();
            }
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = {
    callSendAPI
}