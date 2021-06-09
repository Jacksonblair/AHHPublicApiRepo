const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

router.get('/', async (req, res) => {
	try {
		let result = await queries.getCurrentNeeds()
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_CURRENT_NEEDS, needs: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_CURRENT_NEEDS })
	}
})

module.exports = router