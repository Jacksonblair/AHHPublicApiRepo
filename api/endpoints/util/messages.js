const MESSAGES = {
	SUCCESS: {
		/* Auth */
		ADDED_ORG: "Successfully added organization",
		LOGGED_IN: "Successfully logged in",

		/* Org */
		UPDATED_ORG_PROFILE: "Successfully updated organization account details",
		UPDATED_ORG_ABOUT: "Successfully updated organization 'About'",
		
		ADDED_NEED: "Successfully added need",

		GOT_ORG_PROFILE: "Got organization profile",
		GOT_NEED: "Got need",
		GOT_NEEDS: "Got needs"
	},
	ERROR: {
		GENERIC: "Server error",

		/* Org */
		NOT_ORG_OWNER: "You do not own this organization",
		INVALID_ORG_DETAILS: "Organization details are invalid",

		CANT_UPDATE_ORG_PROFILE: "Could not update organization account details",
		CANT_UPDATE_ORG_ABOUT: "Could not update organization 'About'",

		CANT_ADD_ORG: "Could not add organization",
		CANT_ADD_NEED: "Could not add need",

		CANT_GET_NEED: "Could not get need",
		CANT_GET_NEEDS: "Could not get needs",
		CANT_GET_ORG_PROFILE: "Could not get organization profile",

		/* Auth */
		CANT_LOG_IN: "Could not log in",
		INCORRECT_CREDENTIALS: "Password and email combination not found",
	}
}

module.exports = MESSAGES;