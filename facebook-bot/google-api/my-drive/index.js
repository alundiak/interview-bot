const fs = require('fs');
const path = require('path');
const { authorize, getNewToken } = require('../common');
// const { getSpreadsheetData: callback } = require('./my-files');
// const { duplicateSheet } = require('./my-files'); // works, but need to improve creation new tab when similar exists
const { interviewBotLogic } = require('./my-files');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.

// TOKEN_PATH and SCOPES should be different for MT and GL drives.

const TOKEN_PATH = 'token.json';
const tokenPath = path.join(__dirname, TOKEN_PATH);

const CREDENTIALS_PATH = 'credentials.json';
const credentialsPath = path.join(__dirname, CREDENTIALS_PATH);

// Expected to get somehow from ExpressJS Server.
const dataFromBot = {
    newSheetTitle: 'Andrii Lundiak (Bot)',
    candidateEmail: 'landike@gmail.com',
    formularz: {
        css: 2,
        javascript: 3,
        react: 1,
        angular: 1,
        nodejs: 1
    },
    formularzArray: [
        [3,6],
        [2,3],
        [1,3],
        [2,3],
        [2,3],
    ]
};

const resetFormularzArray = [
    [0,0],
    [0,0],
    [0,0],
    [0,0],
    [0,0],
];

dataFromBot.formularzArray = resetFormularzArray;

//
// Main Interview Bot Callback logic.
//
function callback(auth) {
    interviewBotLogic(auth, dataFromBot);
    // duplicateSheet(auth, dataFromBot);
};

// Load client secrets from a local file.
fs.readFile(credentialsPath, (err, content) => {
    // content is Buffer.

    if (err) {
        return console.log('Error loading client secret file:', err);
    }

    // Authorize a client with credentials, then call the Google Sheets API.
    const oAuth2Client = authorize(JSON.parse(content));

    fs.readFile(tokenPath, (err, token) => {
        if (err) {
            return getNewToken(oAuth2Client, callback, tokenPath, SCOPES);
        }
        oAuth2Client.setCredentials(JSON.parse(token));

        callback(oAuth2Client);
    });

});