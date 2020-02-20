let mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

let connection = mysql.createConnection({
	host     : process.env.DB_HOST,
	user     : process.env.DB_USER,
	password : process.env.DB_PASSWORD,
	database : process.env.DB_NAME
});

connection.connect(function(err) {
	if (err) throw err
});

module.exports = connection;