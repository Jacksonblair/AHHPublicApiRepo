module.exports = {

	verifyOrgOwner: async (req, res, next) => {
		let userId = req.session.getUserId()
		if (userId == req.params.orgid) {
			next()
		} else {
			res.status(400).send(MESSAGES.ERROR.NOT_ORG_OWNER)
		}
	}

}