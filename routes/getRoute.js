let express = require('express');
let router = express.Router();



router.get('/', function(req, res, next) {
	let mysql      = require('mysql');
	let connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root'
	});

	connection.connect();

	connection.query('SELECT * FROM express', function(err, rows, fields) {
		if (err) return console.log(err);
		console.log('The solution is: ', rows[0].solution);
	});

	connection.end();
  
	res.render('startPage', { title: 'ALT-Application' });
});

module.exports = router;
