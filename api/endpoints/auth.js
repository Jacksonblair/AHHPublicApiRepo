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

		let currentEmail = req.session.getJWTPayload()["email"]
	let userId = req.session.getUserId()

	if (!validation.validateEmail(req.body.email)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_NEW_EMAIL})
		return
	}

	let uuid = uuidv4()

	try {
		// Confirm e-mail is unique first
		let result = await queries.getOrganizationByEmail(req.body.email)
		if (result.rows[0]) {
			if (result.rows[0].id == userId) {
				// Can't change our e-mail to the one we already have
				throw(MESSAGES.ERROR.EMAIL_MUST_BE_DIFFERENT)
			} else {
				// E-mail already in use
				throw(MESSAGES.ERROR.EMAIL_ALREADY_IN_USE)
			}
		}

		await queries.insertEmailChange(uuid, userId, req.body.email)
		// After inserting row in DB, send a confirmation request to current e-mail address
		// This will include a link confirm the UUID against the database entry
		// After which the users email will be updated
		await email.sendEmailChangeConfirmationRequest(currentEmail, uuid)
		res.status(200).send({ message: MESSAGES.SUCCESS.SENT_EMAIL_CHANGE_CONFIRMATION})
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: err })
	}

})

/* Route for users who forgot their password */
router.post('/reset-password', async (req, res) =>{

	/*
 		When user wants to reset their password (if they forgot)..
 		We send a password reset email to their email address
 		Which contains a uuid which they can use to verify a password change
	*/

	console.log(req.body)

	let uuid = uuidv4()

	try {
		// Check that the specified e-mail address actually exists
		let result = await queries.getOrganizationByEmail(req.body.email)
		if (!result.rows[0]) throw(MESSAGES.ERROR.COULD_NOT_RESET_ORG_PASSWORD)
		console.log(result)

		await queries.insertPasswordReset(uuid, result.rows[0].id)
		await email.sendPasswordResetCode(uuid)
		res.status(200).send({ message: MESSAGES.SUCCESS.SENT_PASSWORD_RESET})
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.COULD_NOT_RESET_ORG_PASSWORD})
	}

})

/* Completing forgot password process */
router.post('/complete-reset-password/:uuid', Session.verifySession({sessionRequired: false}), async (req, res) => {

	// Try to find uuid in 'passwordResets' table 
	// If we find it, overwrite the password in the corresponding organizations row with the supplied password

	try {
		// Validate password
		if (!validatePassword(req.body.newPassword)) {
			throw(MESSAGES.ERROR.INVALID_NEW_PASSWORD)
		}

		await queries.completePasswordReset(req.params.uuid, req.body.newPassword)

		// If logged in, log them out to force log in with new password
		if (req.session !== undefined) {
			await req.session.revokeSession()
		}

		res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PASSWORD })							

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: err })
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

	if (!validation.validateOrganization(req.body)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_ORG_DETAILS })
		return
	}
	
	try {
		// Make sure email used to register is unique
		let orgs = await queries.getOrganizationByEmail(req.body.email.toLowerCase())
		if (orgs.rows[0]) {
			throw(MESSAGES.ERROR.EMAIL_ALREADY_IN_USE)
		}

		req.body.password = await bcrypt.hash(req.body.password, saltRounds)
		await queries.insertOrganization(req.body)
		res.status(200).send({ message: MESSAGES.SUCCESS.ADDED_ORG })	

		// Send notification to elise
		email.sendNewOrgNotification(req.body)
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: err })	
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
	    	organization_name: result.rows[0].organization_name,
	    	role: "org",
	    	approved: result.rows[0].approved,
	    	profile_image_url: result.rows[0].profile_image_url
	    })
	    res.status(200).send({ message: MESSAGES.SUCCESS.LOGGED_IN })

	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_LOG_IN })
	}

})



module.exports = router