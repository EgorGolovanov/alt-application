var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var flash = require('req-flash');
var crypto = require('crypto');
var fileUpload = require('express-fileupload')

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
})

connection.connect(function(err) {
	if (err) throw err
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
	secret: 'kjhLKhvsdkjhfdjHUE',
	resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use('/users', express.static(path.join(__dirname + '/public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Стратегия авторизации 
passport.use('login', new LocalStrategy ({
	usernameField : 'username',
	password : 'password',
	passReqToCallback : true
},
function(req, username, password, done) {
	console.log(mysql.escape(username)); 
	connection.query("SELECT * FROM ALT_Database.users WHERE username=" + mysql.escape(username), 
	function(err, rows) {
		console.log(rows);
		if (err) return done(null, false, req.flash('loginMessage', 'SQL error!'));
		
		if (!rows.length) return done(null, false, req.flash('loginMessage', 'No user found!'));
		
		if (!(rows[0].password == crypto.createHash('sha1', 'password').update(password).digest('base64')))
			return done(null, false, req.flash('loginMessage', 'Wrong password!'));
		
		return done(null, rows[0]);
	});
}));

//Стратегия регистрации
passport.use('signup', new LocalStrategy ({
	usernameField : 'username',
	passwordField : 'password',
	passReqToCallback : true
},
function(req, username, password, done) {
	connection.query("SELECT * FROM ALT_Database.users WHERE username=" + mysql.escape(username), 
	function(err, rows) {
		if (err) return done(null, false, req.flash('signupMessage', 'SQL error!'));;
		
		if (rows.length) {
		
			return done(null, false, req.flash('signupMessage', 'That username is already exist'));
		} else {
			let newUser = new Object();
			
			newUser.username = username;
			newUser.password = crypto.createHash('sha1', 'password').update(password).digest('base64');
			
			connection.query("INSERT INTO ALT_Database.users (username, password) VALUES (:Username,:Password)",
			{Username: mysql.escape(newUser.username), Password: mysql.escape(newUser.password)}, 
			function(err, rows) {
				newUser.ID = rows.insertId;
				
				return done(null, newUser);
			});
		}
	});
}));

passport.serializeUser(function(user, done) {
	done(null, user.ID);
});

passport.deserializeUser(function(id, done) {
	connection.query("SELECT ID, username, avatar_url FROM ALT_Database.users WHERE ID=" + parseInt(id, 10), function(err, rows) {
		done(err, rows[0]);
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
