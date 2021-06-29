const Router = require('express-promise-router')
const router = new Router()
const queries = require('../db/queries.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

router.get('/impacts', async (req, res) => {
	try {
		let result = await queries.getImpacts()
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_IMPACTS, impacts: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_IMPACTS })
	}
})

router.get('/supporters', async (req, res) => {
	try {
		let result = await queries.getSupporters()
		res.status(200).send({ message: MESSAGES.SUCCESS.GOT_SUPPORTERS, supporters: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_SUPPORTERS })
	}
})

module.exports = router