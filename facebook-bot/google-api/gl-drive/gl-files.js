//
// Expected place to contain logic in regards to access GL files (read, write, delete)
//
const { google } = require('googleapis');
const spreadsheetId = '1_9T1SLvl-uprH5BVbeSWe9nwXP527dGyC35j83IhGsM';

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1_9T1SLvl-uprH5BVbeSWe9nwXP527dGyC35j83IhGsM/edit#gid=1637430234
 * !!!
 * NOTE - CLOUD PLATFORM DISABLED
 * !!!
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function readTemplateData(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'template!A10:B14',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            rows.map((row) => {
                // console.log(`${row[0]}, ${row[4]}`);
                console.log(row);
            });
        } else {
            console.log('No data found.');
        }
    });
}

module.exports = {
    readTemplateData
}