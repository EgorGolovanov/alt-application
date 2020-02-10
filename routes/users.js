var express = require('express');
var router = express.Router();
let mysql      = require('mysql');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
})

connection.connect(function(err) {
	if (err) throw err
});

router.get('/login', function(req, res, next) {
	res.render('loginForm', { error : req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('login', { 	
	successRedirect: '/',
	failureRedirect: '/users/login',
	failureFlash: true 
}));

router.get('/register', function(req, res) {
	res.render('registerForm', { error : req.flash('signupMessage') });
});

router.post('/register', passport.authenticate('signup', {
	successRedirect: '/users/login',
	failureRedirect: '/users/register',
	failureFlash: true
}));

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;
