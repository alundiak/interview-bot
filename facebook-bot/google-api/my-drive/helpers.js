//
// Spreadsheet Helpers
//
function sanitizeValue(rawValue) {
    return rawValue.replace(/\s/gi, '').toLowerCase();
}

// Takes Spreadsheet standard Rows Array [Arrays] and convert to object { js: '0' }
function convertArrayToObject(rows) {
    console.log(rows);

    const sanitizedRows = rows.map((row) => {
        // console.log(row);
        return [
            sanitizeValue(row[0]),
            row[1]
        ]
    });

    console.log(sanitizedRows);

    const entries = new Map(sanitizedRows);
    const obj = Object.fromEntries(entries);

    console.log(obj);

    return obj;
}

// Takes Spreadsheet standard Rows Array [Arrays] and convert to Array of [ values only ]
function onlyValues(rows) {
    // console.log(rows);
    const values = rows.map((row) => {
        // console.log(row);
        return sanitizeValue(row[1])
    });
    console.log(values);
}

/**
 * To update Spreadsheet, values should follow specific structure.
 *
 * @param is data from Facebook Bot
 *
 * @return {Array[Array]}
 *
 *

Example 5 rows, 1 column
[
    ['cell1.1'],
    ['cell1.2'],
    ['cell1.3'],
    ['cell1.4'],
    ['cell1.5']
]

Example 5 rows, 2 columns
[
    ['cell1.1', 'cell1.2'],
    ['cell2.1', 'cell2.2'],
    ['cell3.1', 'cell3.2'],
    ['cell4.1', 'cell4.2'],
    ['cell5.1', 'cell5.2']
]
 * It should be Array of Array-s. Nested array contains data for cell. As many nested arrays - as many cells/rows updated.
 *
 * If need to update 2 columns and as result 5 rows, and 10 cells. Then data should formatted this way:
 * [
 *      ['cell1.1'],
 *      ['cell1.2'],
 *      ['cell1.3'],
 *      ['cell1.4'],
 *      ['cell1.5']
 * ],
 * [
 *      ['cell2.1'],
 *      ['cell2.2'],
 *      ['cell2.3'],
 *      ['cell2.4'],
 *      ['cell2.5']
 * ]
 *
 */
function composeValuesFroSpreadSheetUpdate(candidateDataFromBot) {

    return [

    ];
}

module.exports = {
    sanitizeValue,
    convertArrayToObject,
    onlyValues,
    composeValuesFroSpreadSheetUpdate
}