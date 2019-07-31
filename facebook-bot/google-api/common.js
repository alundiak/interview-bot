const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

/**
 * Create an OAuth2 client with the given credentials, and then execute the given callback function.
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 * @param {string} TOKEN_PATH from token.json.
 * @param {array} SCOPES
 */
function getNewToken(oAuth2Client, callback, TOKEN_PATH, SCOPES) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                return console.error('Error while trying to retrieve access token', err);
            }
            oAuth2Client.setCredentials(token);

            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Token stored to', TOKEN_PATH);
            });

            callback(oAuth2Client);
        });
    });
}

module.exports = {
    authorize,
    getNewToken
}