const moment = require('moment');
module.exports = function(app, todos, fs, database, crypto)
{
    
    //
    // list the todos
    //
    app.get('/', function(req, res){
        if(req.session.username) {
            
            todos = todos.filter(function( obj ) {
                return obj.userid === req.session.userid;
            });

            // console.log("filtered todos \n " + JSON.stringify(todos));

            // get the count of non-empty elements  
            var count = todos.filter(function(value) {return value !== undefined}).length;
            // console.log(">>> " + req.session.userid + " " + req.session.username);

            
            // console.log("todos \n " + JSON.stringify(todos));
            // render the page
            res.render('index', {moment: moment, ptitle:"Todos", todos: todos, count:count, username: req.session.username, userid: req.session.userid});
        }
        else res.redirect('/login');
    });

    //
    // add a new todo
    //
    app.get('/add', function(req, res){
        if(req.session.username) {
            res.render('add', {ptitle:"Add todo", username: req.session.username, userid: req.session.userid});
        }
        else res.redirect('/login');
    });

    app.get('/add-submit', function(req, res){
        let todotext = req.query.todo;
        let priority = req.query.priority;
        let category = req.query.category;
        let notes = req.query.notes;
        let userid = req.query.userid;

        // save todo to the database
        database.query(
        `INSERT INTO todos (todo, priority, category, notes, userid) VALUES ('${todotext}', '${priority}', '${category}', '${notes}', '${userid}')`,
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
    });

    // 
    // update a todo
    //
    app.get('/update', function(req, res){
        if(req.session.username) {
            res.render('update', {moment: moment, ptitle:"Update Todos", todos: todos, username: req.session.username, userid: req.session.userid});
        }
        else res.redirect('/login');
        
    });

    app.get('/update-submit', function(req, res){
        // update todo fields
        // console.log("priority field " + req.query.priority)
        let todoid = req.query.todoid;
        let priority = req.query.priority;
        let cat = req.query.category;
        let notes = req.query.notes;
        let todo = req.query.todo;

        var sql = "UPDATE todos SET category ='"+cat+"', priority ='"+priority+"', notes ='"+notes+"', todo ='"+todo+"' WHERE id='"+todoid+"'";
        
        database.query(sql, function(err, rows){
            console.log("sql " + rows);
            if(err) {
                return console.log(err);
            }
            else
            {
                // redirect to get todos for updated todos
                res.redirect('/get-todos');
            }
        });
    });
    //
    // completed checkbox
    //
    app.post('/checkcompleted', function(req, res){
        let id = req.body.tid;
        let completed = req.body.checkval;
        
        if(req.session.username) {
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
        if(req.session.username) {
            res.render('delete', {moment: moment, ptitle:"Update Todos", todos: todos, username: req.session.username, userid: req.session.userid});
        }
        else res.redirect('/login');
    });

    app.get('/del-submit/:id', function(req, res){
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
        var sql = "SELECT * FROM users WHERE username='"+req.query.user+"' AND password='"+passhash+"'";
        database.query(sql, function(err, rows){
            // if exist, create session and redirect to home
            if(rows.length > 0) {
                
                req.session.username = req.query.user;
                req.session.userid = rows[0].id;
                
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
        var sql = "SELECT * FROM users WHERE username='"+req.query.user+"' AND password='"+passhash+"'";
        
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
                console.log("no rows " + rows.length);
                var sql = "INSERT INTO users (username, password, name) VALUES ('"+req.query.user+"', '"+passhash+"', '"+req.query.name+"')";
                database.query(sql,function(err, results){
                    if(err) {
                        // database.end();
                        return console.log(err);
                    }
                    else
                    {
                        // database.end();
                        console.log("results " + results);
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

    app.get('/logout-submit', function(req, res){
        req.session.username = false;
        res.redirect('/login');
    });

    //
    // ajax calls
    //
    app.get('/get-todos', function(req, res){
        uid = req.session.userid;
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
    });
    
}
