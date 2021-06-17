const MESSAGES = require('./messages') 

module.exports = {

	verifyOrgOwner: async (req, res, next) => {
		let userId = req.session.getUserId()
		if (userId == req.params.orgid) {
			next()
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.NOT_ORG_OWNER })
		}
	},

	verifyApproved: async (req, res, next) => {
		if (req.session.getJWTPayload()["approved"]) {
			next()
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.ORG_NOT_APPROVED })
		}
	},

	verifyAdmin: async (req, res, next) => {
		let jwtPayload = req.session.getJWTPayload()
		if (jwtPayload.role == "admin") {
			next()
		} else {
			res.status(400).send({ message: MESSAGES.ERROR.NOT_ADMIN })
		}
	}

}