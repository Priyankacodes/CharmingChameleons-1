const path = require('path');
var express = require('express');
var db = require('../database')

var app = express();
var util = require('./lib/hashUtils');
var middleware = require('./middleware');

var cors = require('cors');
const passport = require('passport');   
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

var port = process.env.PORT || 3000;

//Use body parser for parsing the request querystring
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/public')));



//Initialize passport and express
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res, next) {
	//On login check whether new login details

	middleware.authenticate(req.body.username, req.body.password)
	.then((result) => {
		if (result === true) {
	    	res.setHeader(200).send('Login successful')
	    } else {
	    	res.redirect('/')
		}
	})
	.catch((err) => {
		console.log(err)
		res.redirect('/')
	})
});

app.post('/signup', function(req, res, next) {

	middleware.authenticate(req.body.username, req.body.password)
	.then((result) => {
		if(result) {
			//User found
			console.log('User found')
			res.status(201).send('User Exists')
		} else {

			//Create new salt and hash for the user
			var salt = util.createSalt()
			var hash = util.createHash(req.body.password, salt)
			var args = [];

			args.push(req.body.username)
			args.push(hash)
			args.push(salt)
			db.createUser(args)
			.then((data) => {
				console.log('user created')
				res.status(201).send('User created successfully')
			})
			.catch((err) => {
				console.log('err in creating new user', err)
				res.status(500).send('User not created')
			})
		}
	})
	.catch((err) => {
		console.log('err in authenticating user', err)
		res.status(500).send('User not authenticated')
	})
});

app.get('/listings', 
(req, res) => {
  console.log('request received');
  db.getAllListings()
    .then((data) => {
      console.log('grabbed all listings', data);
      //res.end(JSON.stringify(data));
      res.end();
    });
});

//test function 
db.createListing(['sara', 'sfsfsfsfsfsf', 2, 'tag22222s'])
.then((data) => {
	console.log('In server index.js----------------------------------->')
	console.log(data);
})




app.listen(port, function(req, res) {
  console.log('App running on port ' + port);
});
