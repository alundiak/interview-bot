// https://quantizd.com/building-facebook-messenger-bot-with-nodejs/
// https://github.com/waleedahmad/Aww-Bot
'use strict';
require('dotenv').config(); // will provide access for all files.

const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage, handlePostBack } = require('./src/handlers');

const port = 8989;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello. Andrii Lundiak here, with Facebook/Messenger Chat Bot experiments!'));

// Adds support for GET requests to our webhook
// Looks like used for initial setup - to verify webhook.
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    // I used uuid value but it was wrong. Then I used simple number, similar as @waleedahmad
    const VERIFY_TOKEN = '1489296110';

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    console.log(mode, token, challenge);
    // '1489296110' works. Gives this:
    // subscribe 1489296110 1334664535

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {

    let body = req.body;

    if (body.object === 'page') {

        body.entry.forEach(function (entry) {
            console.log('Webhook Entry Messaging', entry.messaging);

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                // TODO
                // https://developers.facebook.com/docs/messenger-platform/send-messages/buttons#postback
                // WHY POSTBACK buttons don't trigger an EVENT???
                // TODO
                handlePostBack(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));