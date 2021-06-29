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
		DELETED_ORG: "Successfully deleted organization",

		/*Needs */
		ADDED_NEED: "Successfully added need",
		GOT_NEED: "Got need",
		GOT_NEEDS: "Got needs",
		UPDATED_NEED: "Successfully updated need",
		DELETED_NEED: "Successfully deleted need",
		EXTENDED_NEED: "Successfully extended need",
		SENT_FULFIL_NEED_NOTIFICATION: "Successfully sent fulfil need notification",
		SET_NEED_FULFILLED: "Successfully set need as 'fulfilled'",

		/* Facebook */
		GOT_FACEBOOK_FEED: "Successfully got Facebook feed",

		/* Admin */
		TOGGLED_NEED_MAJOR: "Successfully toggled need 'major' flag",
		GOT_ALL_ORGS: "Successfully got all organizations",
		TOGGLED_ORG_APPROVAL: "Successfully toggled organization 'approval' flag",
		DELETED_IMPACT: "Successfully deleted impact",
		ADDED_IMPACT: "Successfully added impact",
		UPDATED_IMPACT: "Successfully updated impact",
		TOGGLED_NEED_APPROVAL: "Successfully toggled need 'approval' flag",

		/* Misc */
		GOT_IMPACTS: "Successfully got impacts",
		GOT_SUPPORTERS: "Successfully got supporters",

	},
	ERROR: {
		GENERIC: "Server error",
		NOT_ADMIN: "Admin only route",

		/* Org */
		NOT_ORG_OWNER: "You do not own this organization",
		INVALID_ORG_DETAILS: "Organization details are invalid",
		ORG_NOT_APPROVED: "Organization is not approved",

		CANT_UPDATE_ORG_PROFILE: "Could not update organization account details",
		CANT_UPDATE_ORG_ABOUT: "Could not update organization 'About'",
		COULD_NOT_ADD_ORG: "Could not add organization",
		CANT_GET_ORG_PROFILE: "Could not get organization profile",
		ORG_DOES_NOT_EXIST: "Organization details could not be found",
		CANT_DELETE_ORG: "Could not delete organization",

		/* Needs */
		CANT_ADD_NEED: "Could not add need",
		CANT_GET_NEED: "Could not get need",
		CANT_GET_NEEDS: "Could not get needs",
		CANT_UPDATE_NEED: "Could not update need",
		CANT_DELETE_NEED: "Could not delete need",
		CANT_EXTEND_NEED: "Could not extend need",
		INVALID_NEED: "Need details are invalid",
		INVALID_REGION: "Region is invalid",
		INVALID_FULFILMENT_DETAILS: "Fulfilment details are invalid", 
		CANNOT_FULFIL_OWN_NEED: "Organizations cannot fulfil their own needs",
		ADMIN_CANNOT_FULFIL_NEED: "Admin cannot fulfil need",
		CANT_SET_NEED_FULFILLED: "Could not set need as 'fulfilled'",


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
		PASSWORD_RESET_EXPIRED_OR_NOT_EXIST: "Password reset has expired or does not exist",
		PASSWORD_SAME_AS_PREVIOUS: "New password cannot be the same as the previous password",
		EMAIL_ALREADY_IN_USE: "E-mail is already in use",
		EMAIL_MUST_BE_DIFFERENT: "New e-mail must be different from your current one",

		/* Facebook */
		COULD_NOT_GET_FACEBOOK_FEED: "Could not get facebook feed",

		/* Admin */
		COULD_NOT_GET_ALL_ORGS: "Could not get all organizations",
		CANT_TOGGLE_ORG_APPROVAL: "Could not toggle organization 'approval' flag",
		CANT_DELETE_IMPACT: "Could not delete impact",
		CANT_ADD_IMPACT: "Could not add impact",
		CANT_UPDATE_IMPACT: "Could not update impact",
		CANT_TOGGLE_NEED_APPROVAL: "Could not toggle need 'approval' flag",

		/* MIsc */
		CANT_GET_IMPACTS: "Could not get impacts",
		CANT_GET_SUPPORTERS: "Could not get supporters",


	}
}

module.exports = MESSAGES;