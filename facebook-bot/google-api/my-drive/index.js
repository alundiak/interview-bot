const fs = require('fs');
const { authorize, getNewToken } = require('../common');
// const { getSpreadsheetData: callback } = require('./my-files');
// const { basicReadData: callback } = require('./my-files');
// const { basicWriteData: callback } = require('./my-files');
const { duplicateSheet: callback } = require('./my-files');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = './token.json';

// TOKEN_PATH and SCOPES should be different for MT and GL drives.

const CREDENTIALS_PATH = './credentials.json';

// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
    // content is Buffer.

    if (err) {
        return console.log('Error loading client secret file:', err);
    }

    // Authorize a client with credentials, then call the Google Sheets API.
    const oAuth2Client = authorize(JSON.parse(content));

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return getNewToken(oAuth2Client, callback, TOKEN_PATH, SCOPES);
        }
        oAuth2Client.setCredentials(JSON.parse(token));

        callback(oAuth2Client);
    });

});



