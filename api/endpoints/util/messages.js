const MESSAGES = {
	SUCCESS: {
		/* Auth */
		ADDED_ORG: "Successfully added organization",
		LOGGED_IN: "Successfully logged in",
		SENT_EMAIL_CHANGE_CONFIRMATION: "Successfully sent e-mail change confirmation",
		SENT_PASSWORD_RESET: "Successfully sent password reset e-mail",
		COMPLETED_PASSWORD_RESET: "Successfully completed password reset",


		/* Org */
		UPDATED_ORG_PROFILE: "Successfully updated organization account details",
		UPDATED_ORG_ABOUT: "Successfully updated organization 'About'",
		UPDATED_ORG_PASSWORD: "Successfully updated password",
		UPDATED_ORG_EMAIL: "Successfully updated e-mail",
		GOT_ORG_PROFILE: "Got organization profile",

		/*Needs */
		ADDED_NEED: "Successfully added need",
		GOT_NEED: "Got need",
		GOT_NEEDS: "Got needs",
		UPDATED_NEED: "Successfully updated need",

		/* Facebook */
		GOT_FACEBOOK_FEED: "Successfully got Facebook feed",

	},
	ERROR: {
		GENERIC: "Server error",

		/* Org */
		NOT_ORG_OWNER: "You do not own this organization",
		INVALID_ORG_DETAILS: "Organization details are invalid",

		CANT_UPDATE_ORG_PROFILE: "Could not update organization account details",
		CANT_UPDATE_ORG_ABOUT: "Could not update organization 'About'",

		COULD_NOT_ADD_ORG: "Could not add organization",

		CANT_GET_ORG_PROFILE: "Could not get organization profile",
		ORG_DOES_NOT_EXIST: "Organization details could not be found",

		/* Needs */
		CANT_ADD_NEED: "Could not add need",
		CANT_GET_NEED: "Could not get need",
		CANT_GET_NEEDS: "Could not get needs",
		CANT_UPDATE_NEED: "Could not update need",


		/* Auth */
		COULD_NOT_UPDATE_ORG_PASSWORD: "Could not update password",
		COULD_NOT_RESET_ORG_PASSWORD: "Could not reset organization password",
		CANT_LOG_IN: "Could not log in",
		INCORRECT_CREDENTIALS: "Password and email combination not found",
		INVALID_NEW_PASSWORD: "New password is not valid",
		INVALID_NEW_EMAIL: "New e-mail is not valid",
		INCORRECT_EXISTING_PASSWORD: "Existing password was incorrect",
		COULD_NOT_CONFIRM_EMAIL_CHANGE: "Could not confirm e-mail change",
		COULD_NOT_COMPLETE_PASSWORD_RESET: "Could not complete password reset",

		/* Facebook */
		COULD_NOT_GET_FACEBOOK_FEED: "Could not get facebook feed",
	}
}

module.exports = MESSAGES;