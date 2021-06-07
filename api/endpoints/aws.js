const express = require('express')
const router = express.Router()
const Session = require("supertokens-node/recipe/session");
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')
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

router.get('/signed-policy/:orgid', Session.verifySession(), async (req, res) => {

	console.log(req.body)

	/* Check requesting user owns this org */
	let userId = req.session.getUserId()

	if (userId == req.params.orgid) {

		let key = uuidv4()

		await s3.createPresignedPost({
			Fields: {
				key: key
			},
			Conditions: [
				[ "starts-with", "$Content-Type", "image/" ],
				[ "content-length-range", minFileSize, maxFileSize]
			],
			Expires: 3000,
			Bucket: process.env.AWS_BUCKET_NAME
		}, (err, signed) => {
			if (err) {
				res.status(400).send({ message: "Could not generate signed policy" })
			} else {
				// Send key to frontend
				res.status(200).send({ message: "Succesfully generated signed policy", signed })
			}
		})
	} else {
		res.status(400).send({ message: MESSAGES.ERROR.NOT_ORG_OWNER })
	}


})

module.exports = router;