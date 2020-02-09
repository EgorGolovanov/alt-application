const nameOfSort = ['id asc', 'id desc', 'value asc', 'value desc'];

let express = require('express');
let router = express.Router();
let mysql      = require('mysql');
let passport = require('passport');

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
})

connection.connect(function(err) {
	if (err) throw err
});


router.get('/', function(req, res, next) {
	
	if (!req.user) res.render('startPage', { rows: [], user : req.user });
	
	let query = "SELECT * FROM ALT_Database.express WHERE user_id=" + req.user.ID;
	
	if (req.query.sort && nameOfSort.includes(req.query.sort)) {
		query += (" ORDER BY " + req.query.sort);
	}
	
	connection.query(query, function(err, rows, fields) {
		if (err) return console.log(err);
		res.render('startPage', { rows, user : req.user });
	});

	
});

router.post('/', function(req, res, next) {
	
	if (!req.body) {
		return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
	}
	
	let query = "INSERT INTO ALT_Database.express (`value`,`user_id`) VALUES ('" + req.body.value + "'," + req.user.ID + ")";
	
	connection.query(query, function(err, result) {
		if (err) { 
			return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
		}
		return res.status(201).json({ ID: result.insertId, Value: req.body.value, error: 'None' });
	});

});


router.post('/:id', function(req, res, next) {
	
	if (!req.body) {
		return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
	}
	
	let query = "UPDATE ALT_Database.express SET value=\'" + req.body.value + "\' WHERE ID=" + req.params.id + " AND user_id=" + req.user.ID;
	
	connection.query(query, function(err, result) {
		if (err) {
			return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
		}
		return res.status(200).json({ ID: req.params.id, Value: req.body.value, error: 'None' });
	});
});


router.delete('/:id', function(req,res, next) {
	
	let query = "DELETE FROM ALT_Database.express WHERE ID=" + req.params.id + " AND user_id=" + req.user.ID;
	
	console.log(query);
	
	connection.query(query, function(err, result) {
		if (err) {
			return res.status(500).json({ error: 'Server error.' });
		}
		return res.status(204).json({ error: 'None' });
	});
});

module.exports = router;
