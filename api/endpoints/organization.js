const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const Session = require("supertokens-node/recipe/session");
const auth = require('../auth/index.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')


/* Get org profile details */
router.get('/:orgid/profile', async (req, res) => {

	// If org accessing account is owner of org, send it to them.
	queries.getOrganizationProfileById(req.params.orgid, (err, db_response) => {
		if (err) {
			handleErr(err)
			res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_ORG_PROFILE })
		} else {
			res.status(200).send({ message: MESSAGES.SUCCESS.GOT_ORG_PROFILE, profile: db_response.rows[0]})
		}
	})

})


/* Update org profile details */
router.put('/:orgid/profile', Session.verifySession(), async (req, res) => {

	console.log(req.body)

	let userId = req.session.getUserId()
	if (userId == req.params.orgid) {
		queries.updateOrganizationProfile(userId, req.body, (err, db_response) => {
			if (err) {
				handleErr(err)
				res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
			} else {
				if (db_response.rowCount == 1) { // If we updated a row (success)
					res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PROFILE})
				} else {
					res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
				}
			}
		})
	} else {
		res.status(400).send({ message: MESSAGES.ERROR.NOT_ORG_OWNER})
	}

})

/* Update org profile image details */
router.put('/:orgid/image', Session.verifySession(), async (req, res) => {

	console.log(req.body)

	let userId = req.session.getUserId()
	if (req.session.getUserId() == req.params.orgid) {
		queries.updateOrganizationImage(userId, `https://s3.ap-southeast-2.amazonaws.com/ahelpinghandimagebucket/${req.body.uuid}`, (err, db_response) => {
			if (err) {
				handleErr(err)
				res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
			} else {
				if (db_response.rowCount == 1) { // If we updated a row (success)
					res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_PROFILE})
				} else {
					res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_PROFILE})
				}
			}
		})
	} else {
		res.status(400).send({ message: MESSAGES.ERROR.NOT_ORG_OWNER})
	}
})


/* Update org 'about' details */
router.put('/:orgid/about', Session.verifySession(), async (req, res) => {

	console.log(req.body)

	let userId = req.session.getUserId()
	if (userId == req.params.orgid) {
		queries.updateOrganizationAbout(userId, req.body.about, (err, db_response) => {
			if (err) {
				handleErr(err)
				res.status(400).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_ABOUT })
			} else {
				if (db_response.rowCount == 1) { // If we updated a row (success)
					res.status(200).send({ message: MESSAGES.SUCCESS.UPDATED_ORG_ABOUT })
				} else {
					res.status(200).send({ message: MESSAGES.ERROR.CANT_UPDATE_ORG_ABOUT })
				}
			}
		})
	} else {
		res.status(400).send({ message: MESSAGES.ERROR.NOT_ORG_OWNER})
	}

})

/* Add need */
router.post('/:orgid/needs/add', Session.verifySession(), async (req, res) => {
	console.log(req.body)

	let userId = req.session.getUserId()
	if (userId == req.params.orgid) {

		queries.insertNeed(userId, req.body, (err, db_response) => {
			if (err) {
				handleErr(err)
				res.status(400).send({ message: MESSAGES.ERROR.CANT_ADD_NEED })
				// do something with error
			} else {
				// Get the db id of need back from query
				// Send in response to client
				res.status(200).send({ message: MESSAGES.SUCCESS.ADDED_NEED, id: db_response.rows[0].id })
			}
		})

	} else {
		res.status(400).send({ message: MESSAGES.ERROR.NOT_ORG_OWNER })
	}

})

/* Get need */
router.get('/:orgid/needs/:needid', async (req, res) => {
	queries.getNeed(req.params.needid, (err, db_response) => {
		if (err) {
			handleErr(err)
			res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_NEED })
		} else {
			res.status(200).send({ message: MESSAGES.SUCCESS.GOT_NEED, need: db_response.rows[0] })
		}
	})
})

/* Get all needs for an org */
router.get('/:orgid/needs/', async (req, res) => {
	queries.getNeedsByOrgId(req.params.orgid, (err, db_response) => {
		if (err) {
			res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_NEEDS })
		} else {
			res.status(200).send({ message: MESSAGES.SUCCESS.GOT_NEEDS, needs: db_response.rows })
		}
	})
})

router.delete('/:orgid/needs/:needid/delete', async (req, res) => {


})

router.put('/:orgid/needs/:needid/update', async (req, res) => {

})

module.exports = router