/* var db = window.openDatabase("tracking", "0.1", "Geolocation log", 1000000);
var db_id = 1; */

function createLog(tx) {
    tx.executeSql('DROP TABLE IF EXISTS LOCATIONDEMO');
    tx.executeSql('CREATE TABLE IF NOT EXISTS LOCATIONDEMO (id unique, lon, lat)');
}

function logPosition(tx) {
    tx.executeSql('INSERT INTO LOCATIONDEMO (id, lon, lat) VALUES (' + db_id.toString() + ', ' + lon + ', ' + lat + ')');
    // tx.executeSql('INSERT INTO LOCATIONDEMO (id, lon, lat) VALUES (4, 18.408, 49.716)');
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT * FROM LOCATIONDEMO', [], querySuccess, errorCB);
}

// Query the success callback
//
/*function querySuccess(tx, results) {
    console.log("Returned rows = " + results.rows.length);
    // this will be true since it was a select statement and so rowsAffected was 0
    if (!results.rowsAffected) {
        console.log('No rows affected!');
        return false;
    }
    // for an insert statement, this property will return the ID of the last inserted row
    console.log("Last inserted row ID = " + results.insertId);
}*/

function querySuccess(tx, results) {
    var len = results.rows.length,
        i = 0;
    console.log('GPS log: ' + len + ' rows found.');
    for (i = 0; i < len; i += 1) {
        console.log('Row = ' + i + ' ID = ' + results.rows.item(i).id + ' Data = ' + results.rows.item(i).lat + ', ' + results.rows.item(i).lon);
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
    // db.transaction(queryDB, errorCB);
}

console.log('GPS logger loaded.');