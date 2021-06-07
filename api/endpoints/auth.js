const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const auth = require('../auth/index.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

/*
	Routes specifically about authentication. 
	- (POST) org login
	- (POST) org register
	- (POST) admin login
*/

router.post('/admin/add', async (req, res) => {
	/* Should put an extra layer of security here */
	res.status(400).send()
})

router.post('/admin/login', async (req, res) => {

	console.log(req.body)

	queries.getAdminByEmail(req.body.email, (err, db_response) => {
		if (err) {
			handleErr(err)
			res.status(400).send({ message: MESSAGES.ERROR.CANT_LOG_IN })
		} else {
			auth.compare(req.body.password, db_response.rows[0].password_hash)
			.then(async bcrypt_response => {
				// Details were correct, generate a session.
				if (bcrypt_response == true) {
				    await Session.createNewSession(res, db_response.rows[0].id.toString(), 
				    { // JWT payload
				    	email: db_response.rows[0].email,
				    	role: "admin"
				    });
				    res.status(200).send({ message: MESSAGES.SUCCESS.LOGGED_IN })
				} else {
					res.status(400).send({ message: MESSAGES.ERROR.INCORRECT_CREDENTIALS })
				}
			})	
		}
	})

})

router.post('/org/add', async (req, res) => {

	/*
		TODO: Make sure email used to register is unique
	*/

	let org = req.body

	if (auth.validateOrganization(org) == true) { // Validate org details
		auth.hashPassword(org.password) // Hash password
		.then((hash) => {
			org.password = hash
			queries.insertOrganization(org, (err, db_response) => {
				if (err) {
					handleErr(err)
					res.status(400).send({ message: MESSAGES.ERROR.CANT_ADD_ORG })
				} else {  // Chuck into database
					/* 
						TODO:
						When an org is added
						We send a email notification to elise/admin
						We dont start a session until they log in 
					*/
					// Send response back to client 
					res.status(200).send({ message: MESSAGES.SUCCESS.ADDED_ORG })					
				}
			})
		})
		.catch(err => {
			handleErr(err)
			res.status(400).send({ message: MESSAGES.ERROR.GENERIC })
		})
	} else {
		// Send error code back to client
		 res.status(400).send({ message: MESSAGES.ERROR.INVALID_ORG_DETAILS })
	}

})

router.post('/org/login', async (req, res) => {

	console.log(req.body)

	// Validate password
	queries.getOrganizationByEmail(req.body.email, (err, db_response) => {
		if (err) {
			handleErr(err)
			res.status(400).send({ message: MESSAGES.ERROR.CANT_LOG_IN })
		} else {
			// Compare password input with database password hash
			auth.compare(req.body.password, db_response.rows[0].password_hash)
			.then(async bcrypt_response => {
				// Details were correct, generate a session.
				if (bcrypt_response == true) {
				    await Session.createNewSession(res, db_response.rows[0].id.toString(), 
				    { // JWT payload
				    	email: db_response.rows[0].email,
				    	role: "org",
				    	approved: db_response.rows[0].approved
				    });
				    res.status(200).send({ message: MESSAGES.SUCCESS.LOGGED_IN })
				} else {
					res.status(400).send({ message: MESSAGES.ERROR.INCORRECT_CREDENTIALS })
				}
			})
			.catch(err => {
				res.status(400).send({ message: MESSAGES.ERROR.GENERIC })
				handleErr(err)
			})
		}
	})

})



module.exports = router