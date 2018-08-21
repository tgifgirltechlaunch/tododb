const moment = require('moment');
let tmp = 0;

module.exports = function(app, todos, fs, database, crypto, sortvar)
{
    //
    // list the todos
    //
    app.get('/', function(req, res){
        if(req.session.email) {
            // console.log(">>>> " + req.session.email + " >>>> " + req.session.userid);
            todos = todos.filter(function( obj ) {
                // console.log(">>>> " + obj.userid + " >>>> " + req.session.userid);
                return obj.userid === req.session.userid;
            });

            // get the count of non-empty elements  
            var count = todos.filter(function(value) {return value !== undefined}).length;
            
            if(count === 0 && tmp === 0){
                req.flash('empty', 'There are no existing entries. Please add your first to do.');
            }
            
            else{
                req.flash('empty', '');
                tmp = count;
            }
            
            // render the page
            res.render('index', {message: req.flash('empty'), sort: sortvar, moment: moment, ptitle:"Todos", todos: todos, count:count, username: req.session.username, userid: req.session.userid});
        }
        else res.redirect('/login');
    });

    //
    // add a new todo
    //
    app.get('/add', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;
            sortvar = "";
            database.query("SELECT * FROM todos WHERE userid = '"+uid+"'", function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos[data.id] = data;
                    })
                }
            });
            res.render('add', {ptitle:"Add todo", sort: sortvar, username: req.session.username, email: req.session.email, userid: req.session.userid});
        }
        else res.redirect('/login');
    });

    app.get('/add-submit', function(req, res){
        if(req.session.email) {
            let todotext = req.query.todo.toLowerCase();
            let priority = req.query.priority.toLowerCase();
            let category = req.query.category.toLowerCase();
            let notes = req.query.notes.toLowerCase();
            let userid = req.query.userid;

            // save todo to the database
            database.query(
            "INSERT INTO todos (`todo`, `priority`, `category`, `notes`, `userid`) VALUES (?, ?, ?, ?, ?)", [ todotext, priority, category, notes, userid ],
            function (error, results, fields){
                if(error) throw console.log('add-submit error: ', error);
                
                // res.send(results);
                // console.log("results " + results)
                else{
                    // save todo to the array
                    todos.push(req.query.todo);
                
                    // redirect to get todos for updated todos
                    res.redirect('/get-todos');
                }
            });
        }
        else res.redirect('/login');
    });

    // 
    // update a todo
    //
    app.get('/update', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;
            sortvar = "";
            todos = [];
            // console.log("get todos userid " + uid);
            database.query(`SELECT * FROM todos WHERE userid = ${uid}`, function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos[data.id] = data;
                    })
                    res.render('update', {moment: moment, sort: sortvar, ptitle:"Update Todos", todos: todos, username: req.session.username, email: req.session.email, userid: req.session.userid});
                }
            });
        }
        else res.redirect('/login');
        
    });

    app.post('/update-submit', function(req, res){
        if(req.session.email) {
            // update todo fields
            console.log("priority: " + req.body.priority)
            console.log("todo: " + req.body.todo)
            console.log("notes: " + req.body.notes)
            console.log("category: " + req.body.category)
            console.log("id: " + req.body.todoid)
            console.log("userid: " + req.body.userid)
            let todoid = req.body.todoid;
            let priority = req.body.priority;
            let cat = req.body.category;
            let notes = req.body.notes;
            let todo = req.body.todo;

            var sql = "UPDATE todos SET category ='"+cat+"', priority ='"+priority+"', notes ='"+notes+"', todo ='"+todo+"' WHERE id='"+todoid+"'";
            
            database.query(sql, function(err, rows){
                if(err) {
                    return console.log(err);
                }
                else
                {
                    // redirect to get todos for updated todos
                    res.redirect('/get-todos');
                }
            });
        }
        else res.redirect('/login');
    });
    
    app.post('/getfrmfields', function(req, res){
        if(req.session.email) {
            let boxselect = req.body.inid;
        
            // console.log(">>> id " + id + " completed " + completed);
            database.query(`SELECT * FROM todos WHERE userid = ${uid} AND id = ${boxselect}`, function(error, rows){
                if(error){ console.log("Getfrmfields error: " + error);}
                else{
                    // console.log("Getfrmfields: " + JSON.stringify(rows));
                    res.send(JSON.stringify(rows));
                }
            });
        }
        else res.redirect('/login');
    });



    //
    // completed checkbox
    //
    app.post('/checkcompleted', function(req, res){
        if(req.session.email) {
            let id = req.body.tid;
            let completed = req.body.checkval;
        
            // console.log(">>> id " + id + " completed " + completed);
            database.query("UPDATE `todos` SET `completed` ='"+completed+"' WHERE `id` ='"+id+"'",
            function (error, results, fields){
                if(error){ throw error;}
            });
        }
        else res.redirect('/login');
    });


    //
    // delete a todo
    //
    app.get('/del', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;
            sortvar = "";
            todos = [];
            // console.log("get todos userid " + uid);
            database.query(`SELECT * FROM todos WHERE userid = ${uid}`, function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos.push(data);
                    })

                    res.render('delete', {moment: moment, sort: sortvar, ptitle:"Delete Todos", todos: todos, username: req.session.username, email: req.session.email, userid: req.session.userid});
                }
            });
        }
        else res.redirect('/login');
    });

    app.get('/del-submit/:id', function(req, res){
        if(req.session.email) {
            // delete from array
            let id = req.params.id;

            // console.log("delete todo " + id);
            // delete todo from the database
            database.query(
                `DELETE FROM todos WHERE id = ${id}`,
                function (error, results, fields){
                    if(error) {console.log('delete error: ', error);}
                    else{
                        // redirect to get todos for updated todos
                        res.redirect('/get-todos');
                    }
            });
        }
        else res.redirect('/login');
    });

    //
    // sign up, login and logout a user
    //
    app.get('/login', function(req, res){
        res.render('login', {ptitle: "Login", hideLogin: true, error:req.query.error});
    });
    app.get('/login-submit', function(req, res){
        // test if user/pass exist in the database
        var passhash = crypto.createHash('md5').update(req.query.pass).digest('hex');
        var sql = "SELECT * FROM users WHERE email='"+req.query.email+"' AND password='"+passhash+"'";
        database.query(sql, function(err, rows){
            // if exist, create session and redirect to home
            if(rows.length > 0) {
                //put values in session
                //since there should only be one matching record assign username and id to session for reference
                req.session.email = req.query.email;
                req.session.username = rows[0].username;
                req.session.userid = rows[0].id;
                // console.log("username " + req.session.username);
                res.redirect('/');
                
            // if do not exist, redirect to login page
            } else {
                res.redirect('/login?error=true');
            }
        });
    });

    app.get('/signup', function(req, res){
        res.render('signup', {ptitle: "Sign-Up", hideLogin: true, error:req.query.error});
    });

    app.get('/signup-submit', function(req, res){
        // test if user/pass exist in the database
        var passhash = crypto.createHash('md5').update(req.query.pass).digest('hex');
        var sql = "SELECT * FROM users WHERE email='"+req.query.email+"' AND password='"+passhash+"'";
        
        database.query(sql, function(err, rows){
            // if error, close database connection and console log error
            if(err) {
                // database.end();
                res.redirect('/login?error=true');
                return console.log(err);
            }

            // if record does not exist, insert new user in database
            if (!rows.length)
            {
                // console.log("no rows " + rows.length);
                var sql = "INSERT INTO users (username, password, name, email) VALUES ('"+req.query.user+"', '"+passhash+"', '"+req.query.name+"', '"+req.query.email+"')";
                database.query(sql,function(err, results){
                    if(err) {
                        // database.end();
                        return console.log(err);
                    }
                    else
                    {
                        // console.log("results " + results);
                        res.redirect('/login');
                    }
                });
            }
            else
            {
                // if user exists, redirect to sign in page and present user exists message
                // database.end();
                res.redirect('/login');
            }
        });
    });

    
    //
    // sorting
    //

    app.get('/priority/:pri', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;
            let priority = req.params.pri
            
            //set sort so when a sort selection is made, css shows the selection as curent
            sortvar = priority;
            todos = [];
            // console.log("get todos userid " + uid); 
            database.query("SELECT * FROM todos WHERE userid = '"+uid+"' AND priority = '"+priority+"'", function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos[data.id] = data;
                    })
                    
                    // redirect to home
                    res.redirect('/');
                }
            });
        }
        else res.redirect('/login');
    });

    
    app.get('/status/:stat', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;
            
            if(req.params.stat === 'completed'){
                sortvar = '1';
            }
            else{
                sortvar = '0';
            }
            // console.log("sort: " + sortvar);
            //set sort so when a sort selection is made, css shows the selection as curent
            todos = [];
            // console.log("get todos userid " + uid); 
            database.query(`SELECT * FROM todos WHERE userid = ${uid} AND completed = ${sortvar}`, function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos[data.id] = data;
                    })
                    
                    // redirect to home
                    res.redirect('/');
                }
            });
        }
        else res.redirect('/login');
    });

    app.get('/date/:event', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;
            
            if(req.params.event === 'old'){
                sortvar = 'ASC';
            }
            else{
                sortvar = 'DESC';
            }
            console.log("sort: " + sortvar);
            //set sort so when a sort selection is made, css shows the selection as curent
            todos = [];
            
            database.query("SELECT * FROM todos WHERE userid = "+uid+" ORDER BY id "+sortvar, function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data, index){
                        todos[index] = data;
                        // console.log("record >>> " + JSON.stringify(data) + " dataid: " + index);
                    })

                    // redirect to home
                    res.redirect('/');
                    
                }
            });
        }
        else res.redirect('/login');
    });
    
    //
    // Get Todos
    //
    //grab all records that match the signed in user and redirect to home
    app.get('/get-todos', function(req, res){
        if(req.session.email) {
            uid = req.session.userid;

            //reset sort so when home is clicked css shows home as curent
            sortvar = "";
            todos = [];

            // console.log("get todos userid " + uid);
            database.query(`SELECT * FROM todos WHERE userid = ${uid}`, function(error, rows){
                if(error){console.log('get-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos[data.id] = data;
                    })

                    // redirect to home
                    res.redirect('/');
                }
            });
        }
        else res.redirect('/login');
    });

    //a type of refresh, otherwise server must be restarted to see changes
    //grab all records and redirect user to login if signed out or home screen if signed in
    app.get('/get-all-todos', function(req, res){
        if(req.session.email) {
            sortvar="";
            todos = [];
            database.query(`SELECT * FROM todos`, function(error, rows){
                if(error){console.log('get-all-todos error: ', error);}
                else{
                    // load todos from the database
                    rows.forEach(function(data){
                        todos[data.id] = data;
                    })
                    if(req.session.email) {
                        // redirect to login
                        res.redirect('/');
                    }
                    else{
                        // redirect to login
                        res.redirect('/login');
                    } 
                }
            }); 
        }
        else res.redirect('/login');
    });

    app.get('/logout-submit', function(req, res){
        req.session.email = false;
        res.redirect('/get-all-todos');
    });

}
