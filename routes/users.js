const authenticationMiddleware = require('../middleware/middleware');

var express = require('express');
var router = express.Router();
let path = require('path');
let passport = require('passport');
let models = require('../models');

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
router.get('/login', function(req, res) {
	if (req.isAuthenticated())
		res.redirect('/');
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
router.get('/account', authenticationMiddleware, function(req, res) {
	res.render('accountPage', { user : req.user });
});

//Изменение аватара пользователя
router.post('/account', authenticationMiddleware, function(req, res) {

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.render('accountPage', { 
			user : req.user, 
			error : "Click on image to select file and try again!" 
		});
	}

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
		
		let updateItem = { avatar_url: localPath };
		
		models.users.update(updateItem, {
			where: {
				id: req.user.id
			}
		}).then((result) => {				
			req.user.avatar_url = localPath;

			return res.render('accountPage', { 
				user : req.user
			});
		}).catch(err=>{
			return res.render('accountPage', { 
				user : req.user, 
				error : "Server error" 
			});
		});
	}
	return res.render('accountPage', { user : req.user });
});

module.exports = router;
