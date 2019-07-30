//
// Expected to be file for common code, mainly API related,
//
const request = require('request');

const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
const baseURI = 'https://graph.facebook.com/v4.0/';

// Sends response messages via the Send API
// Send the HTTP request to the Messenger Platform
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