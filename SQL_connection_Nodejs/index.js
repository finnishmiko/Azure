//npm install tedious
var Connection = require('tedious').Connection;
var config = {
    userName: '<username>@<SQL server>',
    password: 'password',
    server: '<SQL server>.database.windows.net',
    // If you are on Microsoft Azure, you need this:
    options: {encrypt: true, database: '<DB name>'}
};
var connection = new Connection(config);
connection.on('connect', function(err) {
// If no error, then good to proceed.
    console.log("Connected");
    executeStatement();
});

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

function executeStatement() {
    request = new Request("SELECT * FROM <SQL DB table name>;", function(err) {
    if (err) {
        console.log(err);}
    });
    var result = "";
    request.on('row', function(columns) {
        columns.forEach(function(column) {
          if (column.value === null) {
            console.log('NULL');
          } else {
            result+= column.value + " ";
          }
        });
        console.log(result);
        result ="";
    });

    request.on('done', function(rowCount, more) {
    console.log(rowCount + ' rows returned');
    });
    connection.execSql(request);
}
