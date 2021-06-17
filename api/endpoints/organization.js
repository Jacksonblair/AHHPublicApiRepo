const Router = require('express-promise-router')
const router = new Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const auth = require('../auth/index.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')
const mw = require('./util/middleware')
const validation = require('./util/validation')
const email = require('./util/email')

/* Get org profile details */
router.get('/:orgid/profile', async (req, res) => {
	try {
		let result = await queries.getOrganizationProfileById(req.params.orgid)
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_ORG_PROFILE, profile: result.rows[0]})
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_ORG_PROFILE })
	}
})

/* Update org profile details */
router.put('/:orgid/profile', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	// TODO: Valiate profile details
	if (!validation.validateUpdateOrganization(req.body)) {
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
		return
	}

	try {
		let result = await queries.updateOrganizationProfile(req.params.orgid, req.body)
		if (result.rowCount = 1) {
			res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PROFILE})
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
		}
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
	}

})

/* Delete org */
router.delete('/:orgid', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	/* TODO: Let orgs get deleted this easily? Should we save the details incase its a mistake? */
	/*  */


	try {
		let result = await queries.deleteOrganization(req.params.orgid)
		if (result.rowCount = 1) {
			await req.session.revokeSession()
			res.status(200).send({ message: MESSAGES.SUCCESS.DELETED_ORG})
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.CANT_DELETE_ORG})
		}
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_DELETE_ORG})
	}


})


/* Update org profile image details */
router.put('/:orgid/image', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {
	try {
		let result = await queries.updateOrganizationImage(req.session.getUserId(), `https://s3.ap-southeast-2.amazonaws.com/ahelpinghandimagebucket/${req.body.uuid}`)
		if (result.rowCount == 1) {
			res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PROFILE})
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
		}
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
	}
})

/* Update org 'about' details */
router.put('/:orgid/about', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	// TODO: Validate details

	try {
		let result = await queries.updateOrganizationAbout(req.session.getUserId(), req.body.about)
		if (result.rowCount == 1) {
			res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_ABOUT })
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_ABOUT })
		}
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_ABOUT })
	}
})

/* Add need */
router.post('/:orgid/needs/add', Session.verifySession(), mw.verifyOrgOwner, mw.verifyApproved, async (req, res) => {
	
	console.log(req.body)

	// Validate need
	if (!validation.validateNeed(req.body)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_NEED })
		return
	}
	
	try {
		let result = await queries.insertNeed(req.session.getUserId(), req.body)
		res.status(200).send({ message: MESSAGES.SUCCESS.ADDED_NEED, id: result.rows[0].id })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_ADD_NEED })
	}
})

/* Get need */
router.get('/:orgid/needs/:needid', async (req, res) => {
	try {
		let result = await queries.getNeed(req.params.needid)
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_NEED, need: result.rows[0] })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_NEED })
	}
})

/* Delete need */
router.delete('/:orgid/needs/:needid', async (req, res) => {
	try {
		let result = await queries.deleteNeed(req.params.needid)
		res.status(200).send({ message: MESSAGES.SUCCESS.DELETED_NEED })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_DELETE_NEED })	
	}
})

/* Get all needs for an org */
router.get('/:orgid/needs/', async (req, res) => {
	try {
		let result = await queries.getNeedsByOrgId(req.params.orgid)
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_NEEDS, needs: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_NEEDS })
	}
})

/* Update a need */
router.put('/:orgid/needs/:needid', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	// Validate new need details
	if (!validation.validateNeed(req.body)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_NEED })
		return
	}

	try {
		let result = await queries.updateNeed(req.params.needid, req.body)
		res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_NEED })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_NEED })
	}
})

/* Fulfil a need*/
router.post('/:orgid/needs/:needid/fulfil', async (req, res) => {

	res.status(400).send({ message: "Sorry still working on this!"})

	// // We validate the details of the fulfilment
	// if (!validation.validateFulfilment(req.body)) {
	// 	res.status(400).send({ message: MESSAGES.ERROR.INVALID_FULFILMENT_DETAILS })
	// 	return
	// }

	// try {
	// 	// TODO: Single query?? 

	// 	// Get e-mail of organization & targeted need
	// 	let result = await queries.getOrganizationEmailbyId(req.params.orgid)
	// 	let _result = await queries.getNeed(req.params.needid)

	// 	if (result.rows[0] && _result.rows[0]) {

	// 		// Add a 'reminder' to the database
	// 		await queries.addNeedFulfilledReminder(_result.rows[0].id)

	// 		let orgEmail = result.rows[0].email
	// 		let need = _result.rows[0]
	// 		await email.sendFulfilledNeedNotification(orgEmail, req.body, need)
	// 		res.status(200).send({ message: MESSAGES.SUCCESS.SENT_FULFIL_NEED_NOTIFICATION })
	// 	} else {
	// 		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_ORG_PROFILE })
	// 	}
	// } catch (err) {
	// 	handleErr(err)
	// }

})


module.exports = router