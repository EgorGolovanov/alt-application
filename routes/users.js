var express = require('express');
var router = express.Router();
let path = require('path');
let passport = require('passport');
let connection = require('../config/config');

let MIMETYPE = [
	'image/jpeg',
	'image/png'
];

//Проверка файла по MIME TYPE 
function CheckValidFile(mimetype) {
	if (MIMETYPE.includes(mimetype)) return true;
	return false;
}

//Отображение страницы авторизации
router.get('/login', function(req, res, next) {
	res.render('loginForm', { error : req.flash('loginMessage') });
});

//Аутентификация пользователя
router.post('/login', passport.authenticate('login', { 	
	successRedirect: '/',
	failureRedirect: '/users/login',
	failureFlash: true 
}));

//Отображение страницы регистрации
router.get('/register', function(req, res) {
	res.render('registerForm', { error : req.flash('signupMessage') });
});

//Добавление нового пользователя в БД
router.post('/register', passport.authenticate('signup', {
	successRedirect: '/users/login',
	failureRedirect: '/users/register',
	failureFlash: true
}));

//Выход из аккаунта
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

//Отображение страницы аккаунта пользователя
router.get('/account', function(req, res, next) {
	res.render('accountPage', { user : req.user });
});

//Изменение аватара пользователя
router.post('/account', function(req, res, next) {

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.render('accountPage', { 
			user : req.user, 
			error : "No selected files" 
		});
	}	
	console.log(req.files.filedata);
	
	let sampleFile = req.files.filedata;

	if (CheckValidFile(sampleFile.mimetype)) {
		
		let localPath = 'images/' + req.user.username + path.extname(sampleFile.name);

		sampleFile.mv('public/' + localPath, function(err) {
			if (err)
				return res.render('accountPage', { 
					user : req.user, 
					error : "Saved error" 
				});
		});
		
		let query = "UPDATE ?? SET ?? = ? WHERE ?? = ?"
		let values = ['users', 'avatar_url', localPath, 'ID', req.user.ID];

		connection.query(query, values,
		function(err, result) {
			if (err) {
				return res.render('accountPage', { 
					user : req.user, 
					error : "Server error" 
				});
			}
			
			req.user.avatar_url = localPath;

			return res.render('accountPage', { 
				user : req.user
			});
		});
	}
	return res.render('accountPage', { user : req.user});
});

module.exports = router;
