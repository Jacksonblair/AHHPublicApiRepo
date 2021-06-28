// let tasks = [
// 	() => {

// 	},
// ]
let queries = require('./api/db/queries.js')
let email = require('./api/endpoints/util/email')
let db = require('./api/db')


// TODO: Add task for cleaning up unused images in s3? 


module.exports = {

	start: async () => {
		setInterval(async () => {
			console.log("Reminders starting...")

			let result
			let client

			try {
				client = await db.getClient()
				result = await client.query(`
				SELECT fulfilled_need_reminders.*, organizations.email, needs.name
				FROM fulfilled_need_reminders 
				JOIN organizations 
				ON fulfilled_need_reminders.organization_id = organizations.id
				JOIN needs
				ON fulfilled_need_reminders.need_id = needs.id
				WHERE target_date < NOW() AND reminder_sent != True`)
			} catch(err) {
				client.release()
				console.log(err)
				return
			}

			result.rows.forEach(async (reminder) => {
				// Send reminder e-mail for each expired fulfilment 
				// NOTE: We dont have to check if the need exists..
				// .. the reminders will cascade delete if the referenced need is deleted.

				try {
					await email.sendFulfilledNeedReminder(reminder.email, reminder)
					// Need to mark reminder.reminder_sent as True (so we don't send it again on the next reminder interval)
					await client.query(`UPDATE fulfilled_need_reminders SET reminder_sent = True WHERE need_id = $1`, [reminder.need_id])
					console.log(`Sent reminder about need id: ${reminder.need_id} to: ${reminder.email}`)
				} catch(err) {
					client.release()
				}

			})

			client.release()


		}, 1000 * 60 * 60)
	}

}