//
// Expected place to contain logic in regards to access MY files (read, write, delete)
//
const { google } = require('googleapis');

// initial https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
// my https://docs.google.com/spreadsheets/d/18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE/edit
const spreadsheetId = '18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE';

// 0 => Sheet1, 1917458364 => "template",
const sheetIdForToDuplicate = 1917458364;
// But to get initial info about sheetId, need to call getSpreadsheetData() and look to console.log()

const newSheetTitle = "Andrii Lundiak" // TODO - add here info from Facebook/Messenger bot;

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * my https://docs.google.com/spreadsheets/d/18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE/edit#gid=0
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function basicReadData(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A2:E',
    }, (err, res) => {
        if (err) {
            return console.log('The API returned an error: ' + err);
        }
        const rows = res.data.values;
        if (rows.length) {
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log(row);
                // console.log(`${row[0]}, ${row[4]}`);
            });
        } else {
            console.log('No data found.');
        }
    });
}

/**
 *
 * @param {*} auth
 * @param {string} range The range of values to append.
 * @param {object} valueInputOption Value input options.
 * @param {(string[])[]} _values A 2d array of values to append.
 * https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/snippets.js#L194
 * https://developers.google.com/sheets/api/reference/rest/
 */
function basicWriteData(auth, range = 'template!A10:B14', valueInputOption, _values) {
    const sheets = google.sheets({ version: 'v4', auth });

    sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
    }, (err, res) => {
        if (err) {
            return console.log('The API returned an error: ' + err);
        }
        const rows = res.data.values;
        if (rows.length) {
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log(row);
                // console.log(`${row[0]}, ${row[4]}`);
            });
        } else {
            console.log('No data found.');
        }
    });
}

function getSpreadsheetMetaData(auth) {
    // sheets.spreadsheets.developerMetadata.get(request, function (err, response) {

    // }
}

function getSpreadsheetData(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    var request = {
        spreadsheetId,
        ranges: [],
        auth,
    };

    sheets.spreadsheets.get(request, function (err, response) {
        if (err) {
            console.error(err);
            return;
        }
        // console.log(JSON.stringify(response, null, 2));
        // console.log(JSON.stringify(response.data.properties, null, 2));
        console.log(JSON.stringify(response.data.sheets, null, 2));
    });
}

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.sheets/copyTo
// https://developers.google.com/sheets/api/samples/sheet
function duplicateSheet(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    var request = {
        spreadsheetId, // the whole Spreadsheet ID
        sheetId: sheetIdForToDuplicate,
        // more https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/sheets#SheetProperties
        resource: {
            destinationSpreadsheetId: spreadsheetId, // The ID of the spreadsheet to copy the sheet to.
        },
        auth,
    };

    sheets.spreadsheets.sheets.copyTo(request, function (err, response) {
        if (err) {
            console.error(err);
            return;
        }
        // console.log(JSON.stringify(response.data, null, 2));
        renameSheet(auth, response.data.sheetId);
    });
}

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
function renameSheet(auth, sheetId, newSheetTitle) {
    const sheets = google.sheets({ version: 'v4', auth });

    var request = {
        spreadsheetId,
        resource: {
            // A list of updates to apply to the spreadsheet.
            // Requests will be applied in the order they are specified.
            // If any request is not valid, no requests will be applied.
            requests: [
                {
                    updateSheetProperties: {
                        properties: {
                            sheetId, // 0 => Sheet1, 1917458364 => "template", any "1114413753" is a copy of "template".
                            title: newSheetTitle // TODO
                        },
                        fields: 'title' // that was odd in docs to understand '*' vs. 'title'.
                    },
                }
            ]
        },
        auth,
    };

    sheets.spreadsheets.batchUpdate(request, function (err, response) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(JSON.stringify(response, null, 2));
    });
}

module.exports = {
    getSpreadsheetData,
    basicReadData,
    basicWriteData,
    duplicateSheet,
    renameSheet
}