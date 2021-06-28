const Router = require('express-promise-router')
const router = new Router()
const Session = require("supertokens-node/recipe/session");
const MESSAGES = require('./util/messages.js')
const handleErr = require('./util/errors.js')
const mw = require('./util/middleware')
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

	// TODO: Not using the orgid for anything. Remove it? 
	// TODO: Standardize the response messages

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

router.get('/signed-policies/:number', Session.verifySession(), mw.verifyAdmin, async (req, res) => {

	let number = parseInt(req.params.number)
	let keys = new Array(number).fill(0).map(() => uuidv4() )
	let policies = []

	try {
		if (!keys.length) throw("Invalid number of policies requested")
		for (let i = 0; i < keys.length; i++) {
			let policy = await s3.createPresignedPost({
				Fields: {
					key: keys[i]
				},
				Conditions: [
					[ "starts-with", "$Content-Type", "image/" ],
					[ "content-length-range", minFileSize, maxFileSize]
				],
				Expires: 3000,
				Bucket: process.env.AWS_BUCKET_NAME
			})
			policies.push(policy)
		}
		res.status(200).send({ message: "Succesfully generated signed policies", policies })
	} catch(err) {
		handleErr(err)
		res.status(400).send({ message: "Could not generate signed policy" })
	}

})

let deleteImage = async (url) => {
	console.log("Deleting old image url")

	// Parse uuid out of url.
	let uuid = url.substr(url.length - 36, url.length)

	var params = {
		Bucket: "ahelpinghandimagebucket", 
		Key: uuid
	}

	try {
		let result = await s3.deleteObject(params).promise()
		console.log(result)
	} catch(err) {
		handleErr(err)
		console.log(err)
	}
}

module.exports = {
	awsEndpoints: router,
	deleteImage
}
