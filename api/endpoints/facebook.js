const express = require('express')
const router = express.Router()
const queries = require('../db/queries.js')
const auth = require('../auth/index.js')
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

router.get('/', async (req, res) => {

	// TODO: CLEAN THIS UP

	getJSON(`https://graph.facebook.com/101997734969550/feed?fields=story,message,created_time,attachments,child_attachments&access_token&limit=20&access_token=${process.env.FB_LONG_LIVED_PAGE_ACCESS_TOKEN}`)
	.then(_res => {
		res.json(_res)
	})
	.catch(err => {
		console.log(err)
	})
})


module.exports = router