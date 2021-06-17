// let tasks = [
// 	() => {

// 	},
// ]
let queries = require('./api/db/queries.js')
let email = require('./api/endpoints/util/email')

module.exports = {

	start: async () => {
		setInterval(async () => {
			/*
				Fulfilled_need_reminders

				When a need is fulfilled, we add a reminder of type fulfilled_need to the db
				with a target date of 2 weeks away

				When that 2 weeks passes, we send a reminder to the agency asking them to delete the need if its no longer active
				And then we flag the need as 'inactive', which will make it show up on the admin cp as 'inactive'.

				Then the administrator has to decide manually what to do with it.
			*/

			// let result = await queries.getExpiredFulfilledNeedReminders()
			// result.rows.forEach((reminder) => {
			// 	// Send reminder e-mail for each expired fulfilment 
			// 	// NOTE: We dont have to check if the need exists..
			// 	// .. the reminders will cascade delete if the referenced need is deleted.
			// 	email.

			// 	// Delete all expired reminders after this, so we don't use them again.


			// })

		}, 1000 * 60 * 5)
	}

}