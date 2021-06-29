const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const validation = require('./util/validation')
const bcrypt = require('bcrypt')
const saltRounds = 10
const { deleteImage } = require('./aws')

const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

const email = require('./util/email.js')
const mw = require('./util/middleware')


router.get('/get-hash', async (req, res) => {
	console.log(req.body)
	let hash = await bcrypt.hash(req.body.password, saltRounds)
	res.json(hash)
})

// Admin route for getting all needs
router.get('/needs', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		let result = await queries.adminGetAllNeeds()
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_NEEDS, needs: result.rows })
	} catch(err) {
		console.log(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_NEEDS })
	}
})

// Admin route for getting all organizations
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
		res.status(200).send({ message: MESSAGES.SUCCESS.TOGGLED_NEED_MAJOR })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_NEED })
	}

})

/* Toggle 'approved' flag on need */
router.put('/needs/:needid/toggle-approved', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		await queries.toggleNeedApproved(req.params.needid)
		res.status(200).send({ message: MESSAGES.SUCCESS.TOGGLED_NEED_APPROVAL })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_TOGGLE_NEED_APPROVAL })
	}
})

/* Admin get impacts */
router.get('/impacts', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		let result = await queries.adminGetImpacts()
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_IMPACTS, impacts: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_IMPACTS })	
	}
})

/* Admin delete impact */
router.delete('/impacts/:impactid', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		let result = await queries.adminDeleteImpact(req.params.impactid)
		res.status(200).send({ message: MESSAGES.SUCCESS.DELETED_IMPACT })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_DELETE_IMPACT })	
	}
})

/* Admin add impact */
router.post('/impacts/add', Session.verifySession(), mw.verifyAdmin, async (req, res) => {

	// If there are any uuids in the body, we need to format them a ',' separated string
	// And store that in the impact_image_urls as text
	let uuids = req.body.uuids.map((uuid) => {
		return `https://s3.ap-southeast-2.amazonaws.com/ahelpinghandimagebucket/${uuid}`
	})
	req.body.urls = uuids.join(',')

	try {
		let result = await queries.adminAddImpact(req.body)
		res.status(200).send({ message: MESSAGES.SUCCESS.ADDED_IMPACT })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_ADD_IMPACT })	
	}
})

/* Admin update impact */
router.put('/impacts/:impactid', Session.verifySession(), mw.verifyAdmin, async (req, res) => {

	// We get a list of new uuids to store with the impact
	// And a list of previous image urls to delete (if any)
	try {

		// Get urls we want to delete
		let result = await queries.adminGetImpactById(req.params.impactid)
		let previousImageUrls = result.rows[0].impact_image_urls.split(',')
		let updatedUrls = previousImageUrls.filter((url) => {
			return !req.body.delete.includes(url)
		})

		// Extract uuid from url and send request to amazon to delete each one
		req.body.delete.map(async (url) => {
			await deleteImage(url.substr(64, url.length))
		})

		// Format new image urls
		let newUrls = req.body.uuids.map((uuid) => {
			return `https://s3.ap-southeast-2.amazonaws.com/ahelpinghandimagebucket/${uuid}`
		})

		// Join existing and new together and update row	
		req.body.urls = [...updatedUrls, ...newUrls].join(',')

		let _result = await queries.adminUpdateImpact(req.params.impactid, req.body)
		res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_IMPACT, impact: _result.rows[0] })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_IMPACT })		
	}
})

/* Add Supporter */
router.post('/supporters/add', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		let result = await queries.getSupporters()
		let supporters = result.rows[0].list.split(',').filter((e) => e)
		supporters.push(req.body.supporter)
		await queries.adminUpdateSupporters(supporters.join(','))		
		res.status(200).send({ message: 'Succesfully added supporter' })			
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: 'Could not add supporter' })			
	}
})

/* Remove Supporter */
router.post('/supporters/delete', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		let result = await queries.getSupporters()
		console.log(result.rows[0].list)

		// Filter out empty indices OR the specified supporter we want to remove
		let supporters = result.rows[0].list.split(',').filter((e) => e)
		supporters.splice(supporters.indexOf(req.body.supporter), 1)

		await queries.adminUpdateSupporters(supporters.join(','))		
		res.status(200).send({ message: 'Succesfully removed supporter' })			
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: 'Could not removed supporter' })			
	}
})

/* Delete need */
router.delete('/needs/:needid/', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		await queries.deleteNeed(req.params.needid)
		res.status(200).send({ message: MESSAGES.SUCCESS.DELETED_NEED })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_DELETE_NEED })
	}
})

/* Toggle 'approved' flag on organization */
router.put('/org/:orgid/toggle-approved', Session.verifySession(), mw.verifyAdmin, async (req, res) => {
	try {
		await queries.toggleOrganizationApproved(req.params.orgid)
		let updatedOrganizations = await queries.adminGetAllOrganizations()
		res.status(200).send({ message: MESSAGES.SUCCESS.TOGGLED_ORG_APPROVAL, orgs: updatedOrganizations.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_TOGGLE_ORG_APPROVAL })
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