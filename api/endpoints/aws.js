const Router = require('express-promise-router')
const router = new Router()
const Session = require("supertokens-node/recipe/session");
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')
const mw = require('./util/middleware')
const { createHmac } = require('crypto')
const { S3 } = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

// https://www.youtube.com/watch?v=_0xZoh-F-A8

// Create Amazon client object
const s3 = new S3({ region: process.env.AWS_REGION });

// Bucket parameters
const bucketParams = {
	Bucket: process.env.AWS_S3_BUCKET_NAME
}

// Max / min file size
const maxFileSize = 1024 * 1024 * 5
const minFileSize = 1024 // About .1 mb

router.get('/signed-policy/:orgid', Session.verifySession(), mw.verifyOrgOwner, async (req, res) => {

	let key = uuidv4()
	try {
		let signed = await s3.createPresignedPost({
			Fields: {
				key: key
			},
			Conditions: [
				[ "starts-with", "$Content-Type", "image/" ],
				[ "content-length-range", minFileSize, maxFileSize]
			],
			Expires: 3000,
			Bucket: process.env.AWS_BUCKET_NAME
		})
		res.status(200).send({ message: "Succesfully generated signed policy", signed })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: "Could not generate signed policy" })
	}

})

module.exports = router;