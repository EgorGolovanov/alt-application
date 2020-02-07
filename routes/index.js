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
	let field = 'ID', order = 'ASC';

	if (req.query.sort) {
		let sort = req.query.sort;
		field = (sort.indexOf('ID') == -1) ? 'value' : 'ID';
		order = (sort.indexOf('asc') != -1) ? 'ASC' : 'DESC';
	}
	let query = 'SELECT ID, value FROM ALT_Database.express ORDER BY ' + 
	field + ' ' + order;
	
	connection.query(query, function(err, rows, fields) {
		if (err) return console.log(err);
		res.render('startPage', { rows });
	});

	
});

router.post('/', function(req, res, next) {
	
	if (!req.body) {
		return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
	}
	
	let query = "INSERT INTO ALT_Database.express (`value`) VALUES (\'" + req.body.value + "\')";
	
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
	
	
	let query = "UPDATE ALT_Database.express SET value=\'"+ req.body.value + "\' WHERE ID=" + req.params.id;
	
	console.log(query);
	
	connection.query(query, function(err, result) {
		if (err) {
			return res.status(500).json({ ID: 'None', Value: 'None', error: 'Server error.' });
		}
		return res.status(200).json({ ID: req.params.id, Value: req.body.value, error: 'None' });
	});
});


router.delete('/:id', function(req,res, next) {
	
	let query = "DELETE FROM ALT_Database.express WHERE ID=" + req.params.id;
	
	console.log(query);
	
	connection.query(query, function(err, result) {
		if (err) {
			return res.status(500).json({ error: 'Server error.' });
		}
		return res.status(204).json({ error: 'None' });
	});
});

module.exports = router;
