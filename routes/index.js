const nameOfSort = ['id asc', 'id desc', 'value asc', 'value desc'];
const authenticationMiddleware = require('../middleware/middleware').authenticationMiddleware;

let express = require('express');
let router = express.Router();
let models = require('../models');

//Получение данных из БД
router.get('/', authenticationMiddleware, function(req, res) {

	let order = nameOfSort[0].split(' ');

	if (req.query.sort && nameOfSort.includes(req.query.sort)) { 
		order = nameOfSort[nameOfSort.indexOf(req.query.sort)].split(' ');
	}

	models.tasks.findAll({
		where: {
			user_id: req.user.id
		},
		order: [ order ],
		raw: true 
	}).then(tasks=>{
  		res.render('startPage', {
			  rows: tasks,
			  user: req.user
		  })
	}).catch(err=>{
		res.render('startPage', {
			rows: [],
			error: err,
			user: req.user
		})
	});

});

//Добавление объекта в БД
router.post('/', authenticationMiddleware, function(req, res) {

	if (!req.body) {
		return res.status(500).json({ 
			ID: 'None', 
			Value: 'None', 
			error: 'Server error.' 
		});
	}
	
	let newRow = { 
		value: req.body.value, 
		user_id: req.user.id 
	};

	models.tasks.create(newRow)
	.then(result=>{
		return res.status(201).json({ 
			ID: result.id, 
			Value: result.value, 
			error: 'None' 
		});
	}).catch(err=>{
		return res.status(500).json({ 
			ID: 'None', 
			Value: 'None', 
			error: 'Server error.' 
		});
	});
});

//Изменение объекта в БД
router.post('/:id', authenticationMiddleware, function(req, res) {

	if (!req.body.value) {
		return res.status(500).json({ 
			ID: 'None', 
			Value: 'None', 
			error: 'Server error.' 
		});
	}
	let updateItem = { value: req.body.value };
	models.tasks.update(updateItem, {
		where: {
			id: req.params.id,
		  	user_id: req.user.id
		}
	}).then((result) => {				
		return res.status(200).json({ 
			ID: result.id, 
			Value: result.value, 
			error: 'None' 
		});
	}).catch(err=>{
		return res.status(500).json({ 
			ID: 'None', 
			Value: 'None', 
			error: 'Server error.' 
		});
	});
});

//Удаление объекта из БД
router.delete('/:id', authenticationMiddleware, function(req,res) {
	models.tasks.destroy({
		where: {
			id: req.params.id,
			user_id: req.user.id
		}
	}).then((result) => {
		return res.status(204).json({ 
			error: 'None' 
		});
	}).catch(err=>{
		return res.status(500).json({ 
			error: 'Server error.' 
		});
	});
});

module.exports = router;
