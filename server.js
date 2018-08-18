var express = require('express');
var session = require('express-session');
const flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');
var app = express();
const database = require('./database');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8777');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(flash());

app.use("/", express.static(__dirname + "/assets"));


// get the todos from the database
var todos = [];
database.query('SELECT * FROM todos', function(err, rows){
    // load todos from the database
    rows.forEach(function(data){
        todos[data.id] = data;
    });
    var sortvar = '';
    
    // include routers
    require('./router/main')(app, todos, fs, database, crypto, sortvar);

    // hande 404 errors
    app.use(function(req, res){
        req.flash('404', 'Don\'t Panic. It\'s all part of the plan.');
        res.status(404).render('404', {message: req.flash('404'), ptitle: "Page Not Found."});
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
var server = app.listen(8777);
