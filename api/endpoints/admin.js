const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const validation = require('./util/validation')
const bcrypt = require('bcrypt')

const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

const email = require('./util/email.js')
const mw = require('./util/middleware')


router.get('/needs', Session.verifySession(), mw.verifyAdmin, (req, res) => {
	res.send("got all needs")
})

router.get('/orgs', Session.verifySession(), mw.verifyAdmin, (req, res) => {
	res.send("got all orgs")
})


router.post('/add', async (req, res) => {
	/* Should put an extra layer of security here */
	res.status(400).send()
})

/* Admin logging in*/
router.post('/login', async(req, res) => {

	try {
		let result = await queries.getAdminByEmail(req.body.email)
		if (!result.rows[0]) {
			res.status(400).send({ message: MESSAGES.ERROR.INCORRECT_CREDENTIALS })
			return
		}

		let correctPassword = await bcrypt.compare(req.body.password, result.rows[0].password_hash)
		if (!correctPassword) {
			res.status(400).send({ message: MESSAGES.ERROR.INCORRECT_CREDENTIALS })
			return
		}

	    await Session.createNewSession(res, result.rows[0].id.toString(), 
	    { // JWT payload
	    	email: result.rows[0].email,
	    	role: "admin"
	    })
	    res.status(200).send({ message: MESSAGES.SUCCESS.LOGGED_IN })

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_LOG_IN })
	}

})

module.exports = router