var express = require('express');
var router = express.Router();
let path = require('path');
let mysql = require('mysql');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
});

let MIMETYPE = [
	'image/jpeg',
	'image/png'
];

connection.connect(function(err) {
	if (err) throw err
});

function CheckValidFile(mimetype) {
	if (MIMETYPE.includes(mimetype)) return true;
	return false;
}

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

router.get('/account', function(req, res, next) {
	if (req.user.avatar_url === '') {
		res.render('accountPage', { user : req.user, avatarUrl : 'images/default.png' });
	} else {
		res.render('accountPage', { user : req.user, avatarUrl : req.user.avatar_url });
	}
});

router.post('/account', function(req, res, next) {

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.render('accountPage', { user : req.user, avatarUrl : req.user.avatar_url, error : "No selected files" });
	}	

	let sampleFile = req.files.filedata;

	if (CheckValidFile(sampleFile.mimetype)) {
		let localPath = 'images/' + req.user.username + path.extname(sampleFile.name);

		sampleFile.mv('public/' + localPath, function(err) {
			if (err)
				return res.render('accountPage', { user : req.user, avatarUrl : req.user.avatar_url, error : "Saved error" });
		});

		let query = "UPDATE ALT_Database.users SET avatar_url=\'" + localPath + "\' WHERE ID=" + req.user.ID;;

		connection.query(query, function(err, result) {
			if (err) {
				return res.render('accountPage', { user : req.user, avatarUrl : req.user.avatar_url, error : "Server error" });
			}
			
			req.user.avatar_url = localPath;

			return res.render('accountPage', { user : req.user, avatarUrl : req.user.avatar_url });
		});
	}
	return res.render('accountPage', { user : req.user, avatarUrl : req.user.avatar_url });
});

module.exports = router;
