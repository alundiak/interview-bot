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

/**
 * Takes Spreadsheet standard Rows Array [Arrays] and convert to Array of [ values only ]
 * @param {Array} rows
 */
function onlyValues(rows) {
    const values = rows.map((row) => {
        return sanitizeValue(row[1])
    });
}

/**
 * To update Spreadsheet, values should follow specific structure.
 *
 * @param candidateReplies {Object} data from Facebook Bot
 *
 * Example:
 * replies: {
        js: '1',
        react: '1',
        angular: '2',
        tools: '2',
        css: '2'
    }
 *
 * @return {Array[Array]} - It should be Array of Array-s.
 * Nested array contains data for cell.
 * As many nested arrays - as many rows updated.
 * As many nested array contains elements, as many cells will be updated.

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
 * Sure thing, it must match with range.
 *
 */
function composeUpdateValues(candidateReplies) {
    const ret = [];
    for (let key in candidateReplies){
        // TODO support of nested arrays
        //  if (Array.isArray(candidateReplies[key])) {}
        // TODO
        ret.push( [ candidateReplies[key] ] );
    }
    return ret;
    // but if nested needed? - TODO
}

module.exports = {
    sanitizeValue,
    convertArrayToObject,
    onlyValues,
    composeUpdateValues
}