const nameOfSort = ['id asc', 'id desc', 'value asc', 'value desc'];

let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let connection = require('../config/config');

//Получение данных из БД
router.get('/', function(req, res, next) {
	
	if (!req.user) return res.render('startPage', { 
		rows: [], 
		user : req.user 
	});

	let query = "SELECT * FROM ?? WHERE ?? = ?";
	let values = ['express', 'user_id', req.user.ID];

	if (req.query.sort && nameOfSort.includes(req.query.sort)) {
		
		query += (" ORDER BY " + nameOfSort[nameOfSort.indexOf(req.query.sort)]);
	}
	
	connection.query(query, values, function(err, rows, fields) {
		if (err) return res.render('startPage', { 
			rows: [], 
			error : err, 
			user : req.user 
		});
		
		res.render('startPage', { 
			rows, 
			user : req.user 
		});
	});	
});

//Добавление объекта в БД
router.post('/', function(req, res, next) {
	
	if (!req.body) {
		return res.status(500).json({ 
			ID: 'None', 
			Value: 'None', 
			error: 'Server error.' 
		});
	}
	
	let query = "INSERT INTO ?? (??,??) VALUES (?,?)"
	let values = [
		'express', 
		'value', 
		'user_id', 
		req.body.value, 
		req.user.ID
	];
	
	connection.query(query, values,
	function(err, result) {
		if (err) { 
			return res.status(500).json({ 
				ID: 'None', 
				Value: 'None', 
				error: 'Server error.' 
			});
		}
		
		return res.status(201).json({ 
			ID: result.insertId, 
			Value: req.body.value, 
			error: 'None' 
		});
	});

});

//Изменение объекта в БД
router.post('/:id', function(req, res, next) {
	
	if (!req.body.value) {
		return res.status(500).json({ 
			ID: 'None', 
			Value: 'None', 
			error: 'Server error.' 
		});
	}
	
	let query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
	let values = [
		'express', 
		'value', 
		req.body.value, 
		'ID', 
		req.params.id, 
		'user_id', 
		req.user.ID
	];

	connection.query(query, values,
	function(err, result) {
		if (err) {
			return res.status(500).json({ 
				ID: 'None', 
				Value: 'None', 
				error: 'Server error.' 
			});
		}
		
		return res.status(200).json({ 
			ID: req.params.id, 
			Value: req.body.value, 
			error: 'None' 
		});
	});
});

//Удаление объекта из БД
router.delete('/:id', function(req,res, next) {

	let query = "DELETE FROM ?? WHERE ?? = ? AND ?? = ?"
	let values = ['express', 'ID', req.params.id, 'user_id', req.user.ID];
	
	connection.query(query, values,
	function(err, result) {
		if (err) {
			return res.status(500).json({ 
				error: 'Server error.' 
			});
		}
		
		return res.status(204).json({ 
			error: 'None' 
		});
	});
});

module.exports = router;
