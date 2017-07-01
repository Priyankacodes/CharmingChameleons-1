const path = require('path');
var cors = require('cors');
var express = require('express');
var db = require('../database');
var session = require('./models/session');


var app = express();
var util = require('./lib/hashUtils');
var middleware = require('./middleware');


var cors = require('cors');

<<<<<<< HEAD
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')

=======
const redis = require('redis')
const expressSession = require('express-session')
const redisStore = require('connect-redis')(expressSession)
const passport = require('Passport');
const config = require('./config/passport');
const bodyParser = require('body-parser');
var client = redis.createClient();
>>>>>>> Workin login

var port = process.env.PORT || 3000;

app.use(cors());
app.options('*', cors())
//Use body parser for parsing the request querystring
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(cors());

app.set('trust proxy', 1) // trust first proxy



//Initialize passport and express
app.use(passport.initialize());
app.use(passport.session());
<<<<<<< HEAD


app.use(cookieSession({
  name: 'session',
  keys: ['sessionmgmt'],

  // Cookie Options
  cookie: {
  	httpOnly: true,
  	secure: true
   },
  maxAge: 5 * 60 * 60 * 1000 // 5 hours
}))

app.post('/login', function(req, res, next) {

	//check authenticated user
	middleware.authenticateLogin(req.body.username, req.body.password)
		.then((result) => {
			//If yes, create/overwrite session details
			if (result !== false) {
				var user = {
					id: result.id,
					username: result.username
				}
				session.createNewSession(req.headers['user-agent'], req.body.username)
				.then((session) => {
					//req.session.id = session.sessionId //token based on user-agent
					req.session.username = session.username   //username
					req.session.save();

					//store in db?? No for now
					console.log('In app.post/Login before res')
		    		res.status(201).send(user)
				})
				.catch((err) => {
					res.redirect('/')
				})
		    } else {
		   		throw result
			}
		})
		.catch((err) => {
			//If no, not a authenticated user
				//clear cookies and redirect to signup page
			res.redirect('/')
		})
		.error((err) => {
			console.log(err)
			res.redirect('/')
		})
});

app.post('/signup', function(req, res, next) {

	var user = {}
	middleware.authenticateLogin(req.body.username, req.body.password)
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
				console.log('signup', data[0].id)
				user = {
					id: data[0].id,
					username: req.body.username
				};
				console.log('user created')
				//Create new session cookie
				return session.createNewSession(req.headers['user-agent'], req.body.username)
			})
			.then((session) => {
				req.session.id = session.sessionId 		  //token based on user-agent
				req.session.username = session.username   //username
				req.session.save()
				res.status(201).send(user)


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
=======

require('./config/passport')(passport);

app.use(expressSession({
  	name: 'session',
  	secret: 'test',
  	store: new redisStore({
  		host: 'localhost',
  		post: 6379,
  		client,ttl: 260
	}),
	saveUninitialized: false,
	resave: false
}))

app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) { 
        	res.status(409).send(info.errMsg);
        }
        if (!user) { 
        	res.status(409).send(info.errMsg);
        }
        console.log('In app.post user', user)

		req.login(req.body, function(err) {
      		if (err) { throw new Error(err); }
    	});
        res.status(201).send(user)
    })(req, res, next);
});

app.post('/signup', function(req, res, next) {
	passport.authenticate('local-signup', function(err, user, info) {
      if (err) {
      	res.status(500).send(info.errMsg); // will generate a 500 error
      }
      if (!user) {
      	res.status(409).send(info.errMsg);
      }
      console.log('In app.post user', user)
      res.status(201).send(user)
    })(req, res, next);
>>>>>>> Workin login
});

app.get('/listings',
(req, res) => {
  db.getAvailableListings()
    .then((data) => {
      res.end(JSON.stringify(data));
    });
});

app.post('/confirm-booking',

(req, res) => {
	for (let i = 0; i < req.body.booking.length; i++) {
		req.body.booking[i] = parseInt(req.body.booking[i]);
	}
	console.log('request received', req.body.booking);
	db.createBookings(req.body.booking)
		.then((data) => {
			res.status(201).send('Booking created successfully');
		})
		.catch((err) => {
			res.status(500).send('Booking not created');
		});
});

app.get('/userlisting', (req, res) => {
  console.log('request received userlisting for', req.query);
  var params = [req.query.params];
  db.getListingsForUser(params)
    .then((data) => {
      console.log('grabbed all listings for ...', data);
      res.end(JSON.stringify(data));
    });
});

app.get('/borrowerlistings', (req, res) => {
  console.log('request received borrowerlistings for', req.query);
  var params = [req.query.params];
  db.getListingsForBorrower(params)
    .then((data) => {
      console.log('grabbed all borrower listings for ...', data);
      res.end(JSON.stringify(data));
    });
});

app.delete('/deletelisting', (req, res) => {
  console.log('request received deletelisting');
  var params = [req.body.params];
  db.deleteListing(params)
  .then((data) => {
    res.status(201).send('listing deleted');
  })
  .catch((err) => {
    res.status(500).send('listing not deleted', err);
  });
});


<<<<<<< HEAD



app.post('/createlisting',
=======
app.post('/createlisting', 
>>>>>>> Workin login
(req, res) => {
  db.createListing(req.body.params)
    .then((data) => {
      console.log('Created an entry');
      res.end(JSON.stringify(data));
    });
});

app.delete('/deletebooking',
(req, res) => {
  var params = [req.body.params];
  db.deleteBooking(params)
    .then((data) => {
      console.log('booking deleted');
      res.end(JSON.stringify(data));
    });
});

app.listen(port, function(req, res) {
  console.log('App running on port ' + port);
});
