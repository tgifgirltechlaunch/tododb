//mysql is the name of the module that we are going to use to connect to our database
const mysql = require('mysql');
//1 parameter in the object with 4 keys
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tigertodo'
});

//mysql returns object that has the method connect
//we then export our connection to use with any file
connection.connect();
module.exports = connection;

//connection.end();


