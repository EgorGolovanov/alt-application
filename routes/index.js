const nameOfSort = ['id asc', 'id desc', 'value asc', 'value desc'];

let express = require('express');
let router = express.Router();
let mysql      = require('mysql');

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
})

connection.connect(function(err) {
	if (err) throw err
});


router.get('/', function(req, res, next) {
	
	if (!req.user) return res.render('startPage', { rows: [], user : req.user });

	let query = "SELECT * FROM ALT_Database.express WHERE user_id=" + parseInt(req.user.ID, 10);
	
	if (req.query.sort && nameOfSort.includes(req.query.sort)) {
		
		query += (" ORDER BY " + nameOfSort[nameOfSort.indexOf(req.query.sort)]);
	}
	
	connection.query(query, function(err, rows, fields) {
		if (err) return res.render('startPage', { rows: [], error : err, user : req.user });
		
		res.render('startPage', { rows, user : req.user });
	});

	
});

router.post('/', function(req, res, next) {
	
	if (!req.body) {
		return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
	}
	
	connection.query("INSERT INTO ALT_Database.express (`value`,`user_id`) VALUES (:Value,:Id)", 
	{Value: mysql.escape(req.body.value), Id: parseInt(req.user.ID, 10)},
	function(err, result) {
		if (err) { 
			return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
		}
		
		return res.status(201).json({ ID: result.insertId, Value: req.body.value, error: 'None' });
	});

});


router.post('/:id', function(req, res, next) {
	
	if (!req.body.value) {
		return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
	}
	
	connection.query("UPDATE ALT_Database.express SET value= :Value WHERE ID= :Id AND user_id= :User_Id",
	{Value: mysql.escape(req.body.value), Id: parseInt(req.params.id, 10), User_Id: parseInt(req.user.ID, 10)},
	function(err, result) {
		if (err) {
			return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
		}
		
		return res.status(200).json({ ID: req.params.id, Value: req.body.value, error: 'None' });
	});
});


router.delete('/:id', function(req,res, next) {
	connection.query("DELETE FROM ALT_Database.express WHERE ID= :Id AND user_id= :User_Id", 
	{Id: parseInt(req.params.id, 10), User_Id: parseInt(req.user.ID, 10)},
	function(err, result) {
		if (err) {
			return res.status(500).json({ error: 'Server error.' });
		}
		
		return res.status(204).json({ error: 'None' });
	});
});

module.exports = router;
