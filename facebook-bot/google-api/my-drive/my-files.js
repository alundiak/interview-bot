//
// Expected place to contain logic in regards to access MY files (read, write, delete)
//
const { google } = require('googleapis');
const { onlyValues } = require('./helpers');

// initial https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
// my https://docs.google.com/spreadsheets/d/18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE/edit
const spreadsheetId = '18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE';

// 0 => Sheet1, 1917458364 => "template",
// To get initial info about sheetId, need to call getSpreadsheetData() and look to console.log()
const sheetIdForToDuplicate = 1917458364;
// TODO rework this code to be automatic.
const testSheetId = 622666726; // "Andrii Lundiak (Bot)" after duplicate and rename.

const readRange = 'template!A10:B14';
const writeRange = 'Andrii Lundiak (Bot)!B10:C14'; // TODO

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * my https://docs.google.com/spreadsheets/d/18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE/edit#gid=0
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function readData(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
    const data = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: readRange,
    }).then(function (response) {
        return response.data.values || [];
    }, function (reason) {
        console.error('Read Data error: ' + reason.result.error.message);
    });

    return data;
}

/**
 *
 * @param {*} auth
 *
 * @param {string} range The range of values to append.
 *
 * @param {(string[])[]} values A 2d array of values to append.
 * values structure
    [
        [
            Cell values ...
        ],
        [
            Cell values ...
        ],
        And so on - Additional rows ...
    ];
 *
 * @param {object} valueInputOption Value input options.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/ValueInputOption
 *
 * Update
 * https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/snippets.js#L194
 *
 * Batch Update
 * https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/snippets.js#L240
 *
 * https://developers.google.com/sheets/api/reference/rest/
 */
function writeData(auth, values, valueInputOption = 'RAW') {
    const sheets = google.sheets({ version: 'v4', auth });

    const options = {
        spreadsheetId,
        valueInputOption,
        range: writeRange,
        resource: {
            values,
        }
    };

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    sheets.spreadsheets.values.update(options, (err, res) => {
        if (err) {
            return console.log('The API returned an error: ' + err);
        }

        if (res) {
            console.log(res);
            console.log('Updated range - ', res.data.updatedRange);
            console.log('%d columns updated.', res.data.updatedColumns);
            console.log('%d rows updated.', res.data.updatedRows);
            console.log('%d cells updated.', res.data.updatedCells);
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
function duplicateSheet(auth, dataFromBot) {
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

        renameSheet(auth, response.data.sheetId, dataFromBot);
    });
}

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
function renameSheet(auth, sheetId, dataFromBot) {
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
                            title: dataFromBot.newSheetTitle // TODO
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


//
// First we need to duplicate existed "template" sheet.
// Then need to rename it, by name provided from InterviewBot candidate input.
// Then take data from InterviewBot and update spreadsheet cells.
// And finally send some emails, notifications, etc. to GL/TAG.
//
async function interviewBotLogic(auth, dataFromBot) {
    // await duplicateSheet(auth, dataFromBot);
    // await renameSheet(auth, dataFromBot);

    // const spreadSheetData = await readData(auth);
    // const newRows = onlyValues(spreadSheetData);

    const myValues = dataFromBot.formularzArray;

    await writeData(auth, myValues);
}

module.exports = {
    getSpreadsheetData,
    readData,
    writeData,
    duplicateSheet,
    renameSheet,
    interviewBotLogic
}