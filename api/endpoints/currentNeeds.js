const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

router.get('/:region', async (req, res) => {
	
	// Validate region
	if (!["geelong", "corangamite", "warrnambool", "all"].includes(req.params.region)) {
		res.status(400).send({ message: MESSAGES.ERROR.INVALID_REGION })
		return
	}

	try {
		let result 
		if (req.params.region == "all") {
			result = await queries.getCurrentNeeds()
		} else {
			result = await queries.getCurrentNeedsByRegion(req.params.region)
		}
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_CURRENT_NEEDS, needs: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_CURRENT_NEEDS })
	}
})

module.exports = router