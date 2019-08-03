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
const writeRange = 'By Bot!B10:B14'; // if 1 column (Speed Recruiting case)
// const writeRange = 'Andrii Lundiak (Bot)!B10:C14'; // if 2 columns (Theoretical case)
const rangePrefix = '!B10:B14'; // Assumed STANDARD location. Extracted to variable for easy change after migration.

const candidateNameCellPrefix = '!B24'; // if name provided, we can update that cell. If not - email instead.

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
async function duplicateSheet(auth, dataFromBot) {
    // TODO - if I could rename during duplication, then I would use dataFromBot.newSheetTitle
    const sheets = google.sheets({ version: 'v4', auth });

    var options = {
        spreadsheetId, // the whole Spreadsheet ID
        sheetId: sheetIdForToDuplicate,
        // more https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/sheets#SheetProperties
        resource: {
            destinationSpreadsheetId: spreadsheetId, // The ID of the spreadsheet to copy the sheet to.
        },
        auth,
    };

    const data = await sheets.spreadsheets.sheets.copyTo(options)
        .then(function (response) {
            // console.log(JSON.stringify(response.data, null, 2));
            return response.data.sheetId || null;
        }, function (reason) {
            console.error('Duplicate Sheet error: ' + reason.result.error.message); // reason.response. ? // TODO
        });

    return data;
}

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
async function renameSheet(auth, sheetId, dataFromBot) {
    const sheets = google.sheets({ version: 'v4', auth });

    var options = {
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

    const data = await sheets.spreadsheets.batchUpdate(options)
        .then(function (response) {
            // console.log(JSON.stringify(response, null, 2));
            // console.log(response);
            // response data. contains:
            // "data": {
            //     "spreadsheetId": "18OxS8dh_ftYzFBDIoXkt6g4_fQQbwF87P1WH1RAW4mE",
            //     "replies": [
            //       {}
            //     ]
            //   },
            // So not really informative.
            return response.status === 200; // Assumably it's good sign of renaming.
        }, function (reason) {
            console.error('Rename Sheet error: ' + reason.result.error.message); // reason.response. ? // TODO
        });

    return data;
}

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
        console.error('Read Data error: ' + reason.result.error.message); // reason.response. ? // TODO
    });

    return data;
}

/**
 * Update SpreadSheet with information from Candidate.
 *
 * API: Update
 * https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/snippets.js#L194
 *
 * API: Batch Update
 * https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/snippets.js#L240
 *
 * https://developers.google.com/sheets/api/reference/rest/
 *
 * @param {*} auth
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
 * @param {string} range The range of values to append.
 *
 * @param {object} valueInputOption Value input options.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/ValueInputOption
 *
 * @return {object} - info about what has been updated.
 */
async function writeData(auth, values, customRange, valueInputOption = 'RAW') {
    const sheets = google.sheets({ version: 'v4', auth });

    const options = {
        spreadsheetId,
        valueInputOption,
        range: customRange || writeRange,
        resource: {
            values,
        }
    };

    console.log('WRITE DATA options');
    console.log(options);

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    const data = await sheets.spreadsheets.values.update(options)
        .then(function (response) {
            // console.log(JSON.stringify(response, null, 2));

            console.log('Updated range - ', response.data.updatedRange);
            console.log('%d columns updated.', response.data.updatedColumns);
            console.log('%d rows updated.', response.data.updatedRows);
            console.log('%d cells updated.', response.data.updatedCells);

            return response.data;
        }, function (reason) {
            // console.error('Update Spreadsheet error: ', reason);
            // reason.code => 400
            // reason.response.status => 400
            // reason.errors = [ message, domain, reason ]
            console.error('Update Spreadsheet error: ', reason.response.data.error);
        });

    return data;
}

// TODO writeBatchData



//
// First we need to duplicate existed "template" sheet.
// Then need to rename it, by name provided from InterviewBot candidate input.
// Then take data from InterviewBot and update spreadsheet cells.
// And finally send some emails, notifications, etc. to GL/TAG.
//
async function interviewBotLogic(auth, dataFromBot) {
    const newSheetId = await duplicateSheet(auth, dataFromBot); // dataFromBot is optional for now - TODO / research
    console.log('Duplicated sheet created, with sheetId - %d', newSheetId);

    const isRenamed = await renameSheet(auth, newSheetId, dataFromBot);
    console.log('isRenamed', isRenamed)
    console.log('Sheet renamed, with new title - %s', dataFromBot.newSheetTitle);

    // const spreadSheetData = await readData(auth);
    // const newRows = onlyValues(spreadSheetData);

    const cellValues = dataFromBot.formularzArray;
    const customRange = `${dataFromBot.newSheetTitle}${rangePrefix}`;
    const updatedData = await writeData(auth, cellValues, customRange);

    console.log('isUpdated', updatedData);

    if (updatedData){
        const { updatedRange, updatedColumns, updatedRows, updatedCells } = updatedData;
        console.log('Sheet updated with new values from candidate');
        console.log('Range - %s update. %d columns updated. %d rows updated. %d cells updated',
            updatedRange, updatedColumns, updatedRows, updatedCells);
    }

}

module.exports = {
    getSpreadsheetData,
    readData,
    writeData,
    duplicateSheet,
    renameSheet,
    interviewBotLogic
}