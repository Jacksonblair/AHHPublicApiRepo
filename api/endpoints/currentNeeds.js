const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

router.get('/:region', async (req, res) => {
	
	// TODO: Get current needs based on region param
	// TODO: Validate region

	try {
		let result = await queries.getCurrentNeeds(req.params.region)
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_CURRENT_NEEDS, needs: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_CURRENT_NEEDS })
	}
})

module.exports = router