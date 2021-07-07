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

/* Get major needs for a region */
router.get('/major-needs/:region', async (req, res) => {
	try {
		let result = await queries.getMajorNeedsByRegion(req.params.region)
		res.status(200).send({ message: `Successfully got major needs for ${req.params.region}`, needs: result.rows })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: "Could not get major needs for region" })
	}
})

/* Get total fulfilled needs */
router.get('/total-fulfilled-needs', async (req, res) => {
	try {
		let result = await queries.getTotalFulfilledNeeds()
		res.status(200).send({ message: "Successfully got total fulfilled needs", count: result.rows[0].count })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: "Could not get total fulfilled needs" })
	}
})

/* Adjust total fullfilled needs */
router.put('/total-fulfilled-needs', async (req, res) => {
	try {
		let result = await queries.adjustTotalFulfilledNeeds(req.body.amount)
		res.status(200).send({ message: "Successfully adjust total fulfilled needs", count: result.rows[0].count })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: "Could not adjust total fulfilled needs" })
	}
})

module.exports = router