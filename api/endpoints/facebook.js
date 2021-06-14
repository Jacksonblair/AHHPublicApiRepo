const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')
const bent = require('bent')
const getJSON = bent('json')

/*
	Getting a long-lived page access token
	- https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing/

	More token info
	- https://developers.facebook.com/docs/marketing-apis/overview/authentication/

	Also google
	- access token debugger
	- graph api tool
*/





router.get('/:region', async (req, res) => {

	// TODO: Get facebook feed based on region param
	// TODO: Gonna need credentials for each facebook page

	try {
		let result = await getJSON(`https://graph.facebook.com/101997734969550/feed?fields=story,message,created_time,attachments,child_attachments&access_token&limit=20&access_token=${process.env.FB_LONG_LIVED_PAGE_ACCESS_TOKEN}`)
		res.json(result)
	} catch(err) {
		handleErr(err)
		res.status(400).send(MESSAGES.ERROR.COULD_NOT_GET_FACEBOOK_FEED)
	}
})


module.exports = router