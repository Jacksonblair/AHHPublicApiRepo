const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const auth = require('../auth/index.js')
const validation = require('./util/validation')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')
const email = require('./util/email.js')
const mw = require('./util/middleware')
const { v4: uuidv4 } = require('uuid')

// For hashing passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

// email.sendEmail()

/*
	Routes specifically about authentication. 
	- (POST) org login
	- (POST) org register
	- (POST) admin login
*/

router.get('/confirm-update-email/:uuid', Session.verifySession({sessionRequired: false}), async (req, res) => {

	try {
		await queries.confirmUpdateEmail(req.params.uuid)

		if (req.session !== undefined) {
			console.log("Killing session")
			await req.session.revokeSession()
		}

		res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_EMAIL })	

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_CONFIRM_EMAIL_CHANGE})
	}

})

router.post('/org/:orgid/change-email', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	// TODO: Confirm that the new e-mail is unique

	let currentEmail = req.session.getJWTPayload()["email"]
	let userId = req.session.getUserId()

	if (!validation.validateEmail(req.body.email)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_NEW_EMAIL})
		return
	}

	let uuid = uuidv4()

	try {
		let result = await queries.insertEmailChange(uuid, userId, req.body.email)
		// After inserting row in DB, send a confirmation request to current e-mail address
		// This will include a link confirm the UUID against the database entry
		// After which the users email will be updated
		await email.sendEmailChangeConfirmationRequest(currentEmail, uuid)
		res.status(200).send({ message: MESSAGES.SUCCESS.SENT_EMAIL_CHANGE_CONFIRMATION})
	} catch(e) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.GENERIC})
	}

})


router.get('/org/:orgid/reset-password', Session.verifySession(), mw.verifyOrgOwner, async (req, res) =>{

	/*
 		When user wants to reset their password (if they forgot)..
 		We send a password reset email to their email address
 		Which contains a uuid which they can use to verify a password change
	*/

	let userId = req.session.getUserId()
	let uuid = uuidv4()

	try {
		await queries.insertPasswordReset(uuid, req.params.orgid)
		await email.sendPasswordResetCode(uuid)
		res.status(200).send({ message: MESSAGES.SUCCESS.SENT_PASSWORD_RESET})
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_RESET_ORG_PASSWORD})
	}

})


router.post('/complete-reset-password/:uuid', Session.verifySession({sessionRequired: false}), async (req, res) => {

	// Try to find uuid in 'passwordResets' table 
	// If found, use the org id and the new password details in stored in that table
	// And update that organizations email to it

	try {
		await queries.completePasswordReset(req.params.uuid, req.body.newPassword)

		if (req.session !== undefined) {
			await req.session.revokeSession()
		}		

		res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PASSWORD })							

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_COMPLETE_PASSWORD_RESET})
	}

})

router.post('/org/:orgid/update-password', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	if (!validation.validatePassword(req.body.newPassword)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_NEW_PASSWORD})
		return
	}

	let userId = req.session.getUserId()

	try {
		let result = await queries.getOrganizationPasswordHashById(userId)
		let passwordsMatch = await bcrypt.compare(req.body.currentPassword, result.rows[0].password_hash)

		if (!passwordsMatch) {
			res.status(400).send({ message: MESSAGES.ERROR.INCORRECT_EXISTING_PASSWORD })
			return
		}

		let newPasswordHash = await bcrypt.hash(req.body.newPassword, saltRounds)
		let _result = await queries.updateOrganizationPasswordHashById(userId, newPasswordHash)
		res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PASSWORD })

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_UPDATE_ORG_PASSWORD })
	}

})

/* Registering a new organization */
router.post('/org/add', async (req, res) => {

	// TODO: Make sure email used to register is unique

	let newOrg = req.body

	if (!validation.validateOrganization(newOrg)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_ORG_DETAILS })
		return
	}

	// TODO:
	// When an org is added
	// We send a email notification to elise/admin
	// We dont start a session until they log in 

	try {
		newOrg.password = await bcrypt.hash(newOrg.password, saltRounds)
		await queries.insertOrganization(newOrg)
		res.status(200).send({ message: MESSAGES.SUCCESS.ADDED_ORG })	
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_ADD_ORG })	
	}
})

/* Logging in */
router.post('/org/login', async (req, res) => {

	try {
		let result = await queries.getOrganizationByEmail(req.body.email)
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
	    	role: "org",
	    	approved: result.rows[0].approved
	    })
	    res.status(200).send({ message: MESSAGES.SUCCESS.LOGGED_IN })

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_LOG_IN })
	}

})



module.exports = router