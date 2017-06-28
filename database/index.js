const Promise = require('bluebird');
const pg = require('pg');
const url = require('url');

let config = {
  user: "postgres", // name of the user account
  host: "localhost",
  password: "test",
  database: "shareio",
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
};

if (process.env.DATABASE_URL) {


  const params = url.parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');

  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
  };
};

//create connection
var pool = new pg.Pool(config);

 module.exports = {
 //Select all listings
 	getAllListings: () => {
		return new Promise (
 			(resolve, reject) => {
 				pool.query('SELECT * from listings', function (err, result) {
				    if (err) {
				      console.log(err);
				      reject(err);
				    } else {
				    	resolve(JSON.parse(JSON.stringify(result.rows)));
				    }
				})
  		}
 		)
 	},

 	getAvailableListings: () => {
 		return new Promise (
 			(resolve, reject) => {
 				pool.query('SELECT listings.id, listings.name, listings.description, listings.cost, listings.tags FROM listings INNER JOIN bookings ON listings.id != bookings.listingid', function (err, result) {
 					if (err) {
 						console.log(err);
 						reject(err);
 					} else {
 						resolve(JSON.parse(JSON.stringify(result.rows)));
 					}
 				});
 			}
 		)
 	},

	createBookings: (params) => {

		var queryString = 'INSERT INTO bookings (listingId, borrowerId) VALUES ($1, $2) returning id'
		var queryArgs = params

		return new Promise (
			(resolve, reject) => {
				pool.query(queryString, queryArgs, (err, rows) => {
					if (err) {
						reject(err)
						console.log(err);
					} else {
						console.log('got data from createBookings');
						resolve(JSON.parse(JSON.stringify(rows.rows)))
					}
				})
			}
		)
	},

  //Input: Replace the following with its values[userid]
  //Output: Returns all the listings that belongs to one user-> array
	getListingsForUser: (params) => {
		var queryString = 'SELECT * FROM listings LEFT OUTER JOIN bookings \
							ON (listings.id = bookings.listingId) \
						   	WHERE listings.lenderId = $1'
		var queryArgs = params

		return new Promise (
			(resolve, reject) => {
				pool.query(queryString, queryArgs, (err, rows) => {
					if (err) {
						reject (err)
					} else {
						console.log('got listing for user');
						resolve(JSON.parse(JSON.stringify(rows.rows)))
					}
				})
			}
		)
	},

	//Input: Replace the following with its values[userid]
  //Output: Returns the row containing that user id -> array

	getUserName: (params) => {
		var queryString = "SELECT * FROM users WHERE id = $1"
		var queryArgs = params

		return new Promise (
			(resolve, reject) => {
				pool.query(queryString, queryArgs, (err, rows) => {
					if (err) {
						reject (err)
					} else {
						console.log('got username');
						resolve(JSON.parse(JSON.stringify(rows.rows)))
					}
				})
			}
		)
	},

	//Input: Replace the following with its values['username']
  	//Output: Returns the row containing that name -> arra


	getUserId: (params) => {
		var queryString = "SELECT * FROM users WHERE username = $1"
		var queryArgs = params

		return new Promise (
			(resolve, reject) => {
				pool.query(queryString, queryArgs, (err, data) => {
					if (err) {
						reject (err)
					} else {
						resolve(JSON.parse(JSON.stringify(data.rows)))
					}
				})
			}
		)
	},

	//Create New User
	createUser: (params) => {

		var queryString = 'INSERT INTO users (username, hash, salt) VALUES ($1, $2, $3) returning id'
		var queryArgs = params

		return new Promise (
			(resolve, reject) => {
				pool.query(queryString, queryArgs, (err, rows) => {
					if (err) {
						reject (err)
						console.log(err);
					} else {
						console.log('user id');
						resolve(JSON.parse(JSON.stringify(rows.rows)))

					}
				})
			}
		)
	}
}
