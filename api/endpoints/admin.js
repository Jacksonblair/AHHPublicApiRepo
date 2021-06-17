const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const validation = require('./util/validation')
const bcrypt = require('bcrypt')
const saltRounds = 10

const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

const email = require('./util/email.js')
const mw = require('./util/middleware')


router.post('/get-hash', async (req, res) => {
	console.log(req.body)
	let hash = await bcrypt.hash(req.body.password, saltRounds)
	res.json(hash)
})

router.get('/needs', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	res.send("got all needs")
})

router.get('/org', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		let result = await queries.adminGetAllOrganizations()
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_ALL_ORGS, orgs: result.rows })
	} catch(err) {
		console.log(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_GET_ALL_ORGS})
	}
})

/* Toggle 'major' flag on need */
router.put('/needs/:needid/toggle-major', Session.verifySession(), mw.verifyAdmin, async (req, res) => {

	try {
		await queries.toggleNeedMajor(req.params.needid)
		let updatedNeeds = await queries.getCurrentNeeds()
		res.status(200).send({ message: MESSAGES.SUCCESS.TOGGLED_NEED_MAJOR, needs: updatedNeeds.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_NEED })
	}

})

/* Toggle 'approved' flag on organization */
router.put('/org/:orgid/toggle-approved', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		await queries.toggleOrganizationApproved(req.params.orgid)
		let updatedOrganizations = await queries.getAllOrganizations()
		res.status(200).send({ message: MESSAGES.SUCCESS.TOGGLED_ORG_APPROVAL, orgs: updatedOrganizations.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORGANIZATION_APPROVAL })
	}
})


/* Admin logging in*/
router.post('/login', async(req, res) => {

	console.log(req.body)

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