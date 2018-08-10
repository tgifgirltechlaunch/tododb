var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');
var app = express();

// connect to mysql
var conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'YOUR USERNAME HERE',
    password: 'YOUR PASSWORD HERE'
});
conn.query('USE tigers');

// get the tigers from the database
var tigers = [];
conn.query('SELECT * FROM tigers', function(err, rows){
    // load tigers from the database
    rows.forEach(function(data){
        tigers[data.id] = data.name;
    });

    // include routers
    require('./router/main')(app, tigers, fs, conn, crypto);

    // hande 404 errors
    app.use(function(req, res){
        res.status(404).render('404');
    });

    // handle generic errors
    app.use(function(err, req, res, next){
        console.log(err);
        res.status(500).send('The app found an error. Please try again later');
    });
});

// initialize the cookies and session
app.use(cookieParser());
app.use(session({secret: 'qwerty'}));

// initialize the views using ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// start the server
var server = app.listen(8080);
