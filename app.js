var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('req-flash');
var crypto = require('crypto');
var fileUpload = require('express-fileupload')
var models = require('../alt-application/models');

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
	models.users.findAll({
		attributes: ['id', 'username', 'password', 'avatar_url'],
		where: {
			username: username
		}, 
		raw: true
	})
	.then(res=>{
		if (!res.length) return done(null, false, req.flash('loginMessage', 'No user found!'));

		if (!(res[0].password == crypto.createHash('sha1', 'password').update(password).digest('base64')))
			return done(null, false, req.flash('loginMessage', 'Wrong password!'));
	
		return done(null, res[0]);
	})
	.catch(err=>{
		console.log(err);
		return done(null, false, req.flash('loginMessage', 'SQL error!'));
	});
}));

//Стратегия регистрации
passport.use('signup', new LocalStrategy ({
	usernameField : 'username',
	passwordField : 'password',
	passReqToCallback : true
},
function(req, username, password, done) {

	models.users.findAll({
		attributes: ['id', 'username'],
		where: {
			username: username
		}, 
		raw: true
	})
	.then(res=>{
		if (res.length) {
			return done(null, false, req.flash('signupMessage', 'That username is already exist'));
		} else {
			let newUser = { 
				username: username, 
				password: crypto.createHash('sha1', 'password').update(password).digest('base64') 
			};
			models.users.create(newUser)
			.then((result)=>{
				return done(null, result);
			}).catch(error=>{
				return done(null, false, req.flash('signupMessage', 'SQL error!'));		
			})
		}
	})
	.catch(err=>{
		return done(null, false, req.flash('signupMessage', 'SQL error!'));
	});
}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	models.users.findOne({
		attributes: ['id', 'username', 'avatar_url'],
		where: {
			id: id
		}
	}).then(user=>{
    	if(!user) return;
    	done(null, user);
	}).catch(err=>done(err, user));
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
