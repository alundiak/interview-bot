const fs = require('fs');
const path = require('path');
const { authorize, getNewToken } = require('../common');
const { composeUpdateValues } = require('./helpers');
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
// TODO re-do this code to avoid hardcoded technologies.
const resetFormularzArray = [
    [3], // css
    [1], // js
    [1], // react
    [1], // angular
    [3], // tools
];
const resetFormularzArray2Columns = [
    [0, 0], // css
    [0, 0], // js
    [0, 0], // react
    [0, 0], // angular
    [0, 0], // tools
];

module.exports = {
    dataFromBot: {
        newSheetTitle: 'By Bot',
        candidateEmail: 'landike@gmail.com',
        candidatePhone: '123',
        formularzArray: resetFormularzArray
    },

    // TODO - rework into using Promise, because fs.readFile() does NOT return neither Promise, nor Promise-like objects.
    initGoogleApi: function () {
        // Load client secrets from a local file.

        fs.readFile(credentialsPath, (err, content) => {
            // content is Buffer.

            if (err) {
                return console.log('Error loading client secret file:', err);
            }

            // Authorize a client with credentials, then call the Google Sheets API.
            this.oAuth2Client = authorize(JSON.parse(content));

            fs.readFile(tokenPath, (err, token) => {
                if (err) {
                    return getNewToken(this.oAuth2Client, /* callback, */ tokenPath, SCOPES);
                }
                this.oAuth2Client.setCredentials(JSON.parse(token));

                // callback(oAuth2Client);
                this.updateSpreadSheet(); // due to async issue
                // or
                // interviewBotLogic(this.oAuth2Client, this.dataFromBot);
            });

        });
    },

    /**
     *
     * @param {Object} candidateData
     * Example:
     * {
            replies: {
                js: '1',
                react: '1',
                angular: '2',
                tools: '2',
                css: '2'
            },
            email: 'landike@gmail.com',
            name: ''
        }
     */
    setDataFromBot: function (candidateData) {
        const { replies, email, name, phone_number } = candidateData;
        const parsedValues = composeUpdateValues(replies);

        this.dataFromBot['formularzArray'] = parsedValues || resetFormularzArray;
        this.dataFromBot['candidateEmail'] = email; // cell C4

        // TODO
        if (name) {
            this.dataFromBot['newSheetTitle'] = name; // cell B3, and Sheet/Tab Name
        } else {
            this.dataFromBot['newSheetTitle'] = email;
        }

        if (phone_number) {
            this.dataFromBot['candidatePhone'] = phone_number; // cell B4
        }
        // TODO
    },

    // callback: function (/* auth */) {
    //     interviewBotLogic(/* auth ||  */this.oAuth2Client, this.dataFromBot);
    // },

    updateSpreadSheet: function () {
        // this.callback(/* this.oAuth2Client */);
        interviewBotLogic(this.oAuth2Client, this.dataFromBot);
    }
}