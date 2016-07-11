/* var db = window.openDatabase("tracking", "0.1", "Geolocation log", 1000000);
var db_id = 1; */

function createLog(tx) {
    tx.executeSql('DROP TABLE IF EXISTS LocationDemo', [], console.log("Dropping location table."));
    tx.executeSql('CREATE TABLE IF NOT EXISTS LocationDemo (id unique, lon, lat)');
}

function logPosition(tx) {
    tx.executeSql('INSERT INTO LocationDemo (id, lon, lat) VALUES (?,?,?)', [db_id, lon, lat]);
    console.log(db_id, lon, lat);
    // tx.executeSql('INSERT INTO LocationDemo (id, lon, lat) VALUES (4, 18.408, 49.716)');
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT * FROM LocationDemo', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    console.log(results.rows.length + ' rows found.');
    for (var i = 0; i < results.rows.length; i++) {
        console.log(results.rows.item(i));
    }
}

// Transaction error callback
//
function errorCB(err) {
    console.log("Error processing SQL: "+err.code);
    console.log("Error processing SQL: "+err.message);
}

// Transaction success callback
//
function successCB() {
    console.log("Transaction successful.");
    // trackingDb.transaction(queryDB, errorCB);
}

console.log('GPS logger loaded.');