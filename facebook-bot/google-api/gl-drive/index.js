const fs = require('fs');
const { authorize } = require('../common');
const { readTemplateData } = require('./gl-files');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = './token.json';

// Load client secrets from a local file.
fs.readFile('./credentials.json', (err, content) => {
    // content is Buffer.

    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), readTemplateData, TOKEN_PATH, SCOPES);
    // TOKEN_PATH and SCOPES should be different for MT and GL drives.
});