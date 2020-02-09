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
	res.render('loginForm', { });
});

router.post('/login', passport.authenticate('login'), function(req, res) {
	console.log(req.user);
	console.log(req.user.ID);
	console.log(req.user.username);
	res.redirect('/');
});

router.get('/register', function(req, res) {
	res.render('registerForm', { });
});

router.post('/register', passport.authenticate('signup'), function(req, res) {
	res.redirect('/users/login');
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/users/login');
});

module.exports = router;
