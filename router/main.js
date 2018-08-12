module.exports = function(app, todos, fs, database, crypto)
{
    //
    // list the todos
    //
    app.get('/', function(req, res){
        if(req.session.username) {
            // get the count of non-empty elements  
            var count = todos.filter(function(value) {return value !== undefined}).length;

            // render the page
            res.render('index', {ptitle:"Todos", todos: todos, count:count, username: req.session.username});
        }
        else res.redirect('/login');
    });

    //
    // add a new todo
    //
    app.get('/add', function(req, res){
        if(req.session.username) {
            res.render('add', {ptitle:"Add todo", username: req.session.username});
        }
        else res.redirect('/login');
    });

    app.get('/add-submit', function(req, res){
        // save todo to the array
        todos.push(req.query.todo);

        // save todo to the database
        database.query("INSERT INTO todos (todo, priority, category, notes, userid) VALUES ('"+req.query.todo+"', '"+req.query.priority+"', '"+req.query.category+"', '"+req.query.notes+"', '"+req.query.id+"')");

        // redirect to home
        res.redirect('/');
    });

    // 
    // update a todo
    //
    app.get('/update', function(req, res){
        if(req.session.username) {
            res.render('update', {ptitle:"Update todo", username: req.session.username});
        }
        else res.redirect('/login');
    });

    app.get('/update-submit', function(req, res){
        // update todo array
        todos.splice(req.query.pos, 1, req.query.name);

        // update todo from the database
        database.query("UPDATE todos SET name='"+req.query.name+"' WHERE id='"+req.query.pos+"'");

        // redirect to home
        res.redirect('/');
    });
    //
    // completed checkbox
    //
    app.post('/checkcompleted', function(req, res){
        let id = req.body.id;
        let completed = req.body.completed ? 1 : 0;;
        
        console.log("hello " + id + " completed " + completed);

        if(req.session.username) {
            // res.render('/', {ptitle:"Completed Todo", username: req.session.username});
            // update todo array
            
            database.query("UPDATE `todos` SET `completed` ='"+completed+"' WHERE `id` ='"+id+"'",
            function (error, results, fields){
                if(error) throw error;
                console.log('results: ', results);
                res.send(results);
            });
        }
        else res.redirect('/login');
    });


    //
    // delete a todo
    //
    app.get('/del', function(req, res){
        if(req.session.username) {
            res.render('delete', {ptitle:"Delete todo", username: req.session.username});
        }
        else res.redirect('/login');
    });

    app.get('/del-submit', function(req, res){
        // delete from array
        todos.splice(req.query.pos, 1);

        // delete todo from the database
        database.query("DELETE FROM todos WHERE id='"+req.query.pos+"'");

        // redirect to home
        res.redirect('/');
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
            console.log("sql " + rows);
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
        res.send('You ended your session successfully.');
    });

    //
    // ajax calls
    //
    app.get('/get-todos', function(req, res){
        res.json({todos: todos});
    });
}
