module.exports = function(app, tigers, fs, conn, crypto)
{
    //
    // list the tigers
    //
    app.get('/', function(req, res){
        if(req.session.username) {
            // get the count of non-empty elements  
            var count = tigers.filter(function(value) {return value !== undefined}).length;

            // render the page
            res.render('index', {ptitle:"Tigers", tigers: tigers, count:count, username: req.session.username});
        }
        else res.redirect('/login');
    });

    //
    // add a new tiger
    //
    app.get('/add', function(req, res){
        if(req.session.username) {
            res.render('add', {ptitle:"Add tiger", username: req.session.username});
        }
        else res.redirect('/login');
    });

    app.get('/add-submit', function(req, res){
        // save tiger to the array
        tigers.push(req.query.name);

        // save tiger to the database
        conn.query("INSERT INTO tigers (name) VALUES ('"+req.query.name+"')");

        // redirect to home
        res.redirect('/');
    });

    // 
    // update a tiger
    //
    app.get('/update', function(req, res){
        if(req.session.username) {
            res.render('update', {ptitle:"Update tiger", username: req.session.username});
        }
        else res.redirect('/login');
    });

    app.get('/update-submit', function(req, res){
        // update tiger array
        tigers.splice(req.query.pos, 1, req.query.name);

        // update tiger from the database
        conn.query("UPDATE tigers SET name='"+req.query.name+"' WHERE id='"+req.query.pos+"'");

        // redirect to home
        res.redirect('/');
    });

    //
    // delete a tiger
    //
    app.get('/del', function(req, res){
        if(req.session.username) {
            res.render('delete', {ptitle:"Delete tiger", username: req.session.username});
        }
        else res.redirect('/login');
    });

    app.get('/del-submit', function(req, res){
        // delete from array
        tigers.splice(req.query.pos, 1);

        // delete tiger from the database
        conn.query("DELETE FROM tigers WHERE id='"+req.query.pos+"'");

        // redirect to home
        res.redirect('/');
    });

    //
    // login and logout a user
    //
    app.get('/login', function(req, res){
        res.render('login', {ptitle: "Login", hideLogin: true, error:req.query.error});
    });

    app.get('/login-submit', function(req, res){
        // test if user/pass exist in the database
        var passhash = crypto.createHash('md5').update(req.query.pass).digest('hex');
        var sql = "SELECT * FROM users WHERE username='"+req.query.user+"' AND password='"+passhash+"'";
        conn.query(sql, function(err, rows){
            // if exist, create session and redirect to home
            if(rows.length > 0) {
                req.session.username = req.query.user;
                res.redirect('/');
            // if do not exist, redict to login page
            } else {
                res.redirect('/login?error=true');
            }
        });
    });

    app.get('/logout-submit', function(req, res){
        req.session.username = false;
        res.send('You ended your session correctly');
    });

    //
    // ajax calls
    //
    app.get('/get-tigers', function(req, res){
        res.json({tigers: tigers});
    });
}
