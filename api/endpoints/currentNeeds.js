const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')

router.get('/', async (req, res) => {

	// TODO: Pagination ?

	queries.getCurrentNeeds((err, db_response) => {
		if (err) {
			handleErr(err)
			res.status(400).send({ message: MESSAGES.ERROR.CANT_GET_CURRENT_NEEDS })
		} else {
			res.status(200).send({ message: MESSAGES.SUCCESS.GOT_CURRENT_NEEDS, needs: db_response.rows })
		}
	})

})

module.exports = router