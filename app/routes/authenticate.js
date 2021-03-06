/* Node modules */
var express = require('express')

/* Static files */
var User = require('../models/user');
var Address = require('../models/address');

var jwt = require('jsonwebtoken');

// set jsonwebtoken
var fs = require('fs');
var key = require('../../config.js').secret;
module.exports = function () {
	let userRoute = express.Router();

	userRoute.post('/authenticate', function (req, res) {
		let email = req.body.email;
		let password = req.body.password;
		// counts how many times you've tryid some email /password combination
		let counter = req.body.counter;
		if (counter == null || counter == undefined) counter = 0;
		User.findOne({
			email: email
		}, function (err, user) {
			if (!!err) {
				res.send(err);
			} else if (user == null) {
				res.send({ err: 'There is no user with this email', counter: counter++ });
			} else {

				if (user.comparePassword(password) == true) {

					// 5 hours expiration
					var token = jwt.sign({ data: email }, key, { expiresIn: 60 * 60 * 5 });
					res.send({ token: token, id: user._id, userType: user.type, success: true });

				} else {
					res.send({ err: 'Your password is wrong, please try again.', counter: counter++ });
				}
			}
		})
	});

	userRoute.post('/register', (req, res) => {
		let firstName = req.body.firstName;
		let lastName = req.body.lastName;
		let email = req.body.email;
		let password = req.body.password;
		var userObj = new User({
			first_name: firstName,
			last_name: lastName,
			email: email,
			password: password,
			type: 'user'
		});

		User.findOne({
			email: email
		}, function (err, user) {
			if (!!err) {
				res.send(err);
			} else if (!!user) {
				res.send('There is user with this email');
			} else {
				userObj.save((err) => {
					if (!!err) {
						res.send('Something went wrong');
					} else {
						res.send('Succesfully saved');
					}
				});
			}
		});
	});
	userRoute.post('/check-token', (req, res) => {
		let token = req.body.token;
		if (token !== undefined || token != null) {
			jwt.verify(token, key, function (err, decoded) {
				if (!!err) {
					if (err.name == 'TokenExpiredError') res.send({ err: 'Token has expired', success: false });
				} else {
					res.send({ success: true })
				}
			});
		}
	});

	userRoute.post('/profile-data', (req, res) => {
		let { userId } = req.body;
		User.findById(userId, (err, user) => {
			if (!!err) {
				res.json('Something went wrong');
			} else {
				Address.find({userId:userId}, (err, addresses) => {
					if (!!err) {
						res.json('Something went wrong');
					} else {
						res.json({ email: user.email, firstName: user.first_name, lastName: user.last_name, type: user.type, addresses: addresses })
					}
				})
			}
		})
	});

	userRoute.post('/add-address', (req, res) => {
		let { _id, address, postal, city, country } = req.body;
		let newAddress = new Address({ userId: _id, address: address, city: city, country: country, postal: postal });

		newAddress.save((err) => {
			if (!!err) {
				res.json('Something went wrong');
			} else {
				res.json({ success: 'success', message: 'address record is saved' });

			}
		})
	});

    userRoute.get('/addresses/:user_id', (req, res) => {
        let user_id = req.params['user_id'];
        Address.find({
            userId: user_id
        }).populate('userId')
       .exec(function(err, addresses) {
            if(!err && addresses) {
                res.send(addresses);
            }
            else {
                res.send([]);
            }
       })
    })

	return userRoute;
};






