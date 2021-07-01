const db = require('./index.js')
const bcrypt = require('bcrypt')
const saltRounds = 10
const MESSAGES = require('../endpoints/util/messages.js')

/*
	NOTES:
	We pass params to queries as a separate array, because ..
	.. the library will check against SQL injections.
*/

module.exports = {

	/* Admin specific */

	toggleOrganizationApproved: (id) => {
		return db.query('UPDATE organizations SET approved = NOT approved WHERE id = $1', [id])
	},

	toggleNeedMajor: (id) => {
		return db.query('UPDATE needs SET major = NOT major WHERE id = $1', [id])
	},

	toggleNeedApproved: (id) => {
		return db.query('UPDATE needs SET approved = NOT approved WHERE id = $1', [id])
	},

	getAdminByEmail: (email) => {
		return db.query(`SELECT * FROM admins WHERE email = $1`, [email])
	},

	insertAdmin: (details) => {
		/* Should put some extra layer of security here */
	}, 

	adminGetAllOrganizations: () => {
		return db.query(`SELECT 
		id,
		email,
		approved,
		contact_name,
		contact_number,
		organization_name,
		about,
		profile_image_url,
		address,
		apt_suite_bldg,
		city,
		state,
		postcode,
		country 
		FROM organizations`)
	},

	adminGetAllNeeds: () => {
		return db.query(`
		SELECT needs.*,
		(NOW() - target_date) AS time_expired
		FROM needs LEFT OUTER JOIN fulfilled_need_reminders 
		ON needs.id = fulfilled_need_reminders.need_id 
		ORDER BY needs.created_at`)
	},

	adminAddImpact: (details) => {
		return db.query(`INSERT INTO impacts 
			(title, content, impact_image_urls) 
			VALUES ($1, $2, $3)`, [details.title, details.content, details.urls])
	},

	adminGetImpacts: () => {
		return db.query(`SELECT * from impacts ORDER BY created_at`)
	},
 
	adminGetImpactById: (impactId) => {
		return db.query(`SELECT * FROM impacts WHERE id = $1`, [impactId])
	},

	adminDeleteImpact: (impactId) => {
		return db.query(`DELETE FROM impacts WHERE id = $1`, [impactId])
	},

	adminUpdateImpact: (impactId, details) => {
		return db.query(`UPDATE impacts SET 
		title = $2,
		content = $3,
		impact_image_urls = $4
		WHERE id = $1 RETURNING *`, [impactId, details.title, details.content, details.urls])
	},	

	adminUpdateSupporters: (supporters) => {
		return db.query(`UPDATE supporters SET list = $1`, [supporters])
	},





	/* Org queries */

	incrementTotalNeedsFulfilled: () => {
		return db.query(`UPDATE total_needs_fulfilled SET count = count + 1`)
	},

	adjustTotalFulfilledNeeds: (amount) => {
		return db.query(`UPDATE total_needs_fulfilled SET count = count + $1 RETURNING *`, [amount])
	},

	getTotalFulfilledNeeds: () => {
		return db.query(`SELECT * from total_needs_fulfilled`)
	},

	getOrganizationProfileById: (id) => {
		return db.query(`SELECT 
		id,
		email,
		contact_name,
		contact_number,
		organization_name,
		about,
		profile_image_url,
		address,
		apt_suite_bldg,
		city,
		state,
		postcode,
		country
		FROM organizations WHERE id = $1`, [id])
	},

	getOrganizationByEmail: (email) => {
		return db.query(`SELECT * FROM organizations WHERE email = $1`, [email])
	},

	getOrganizationEmailbyId: (id) => {
		return db.query(`SELECT email FROM organizations WHERE id = $1`, [id])
	},


	getOrganizationPasswordHashById: (id) => {
		return db.query(`SELECT password_hash FROM organizations WHERE id = $1`, [id])
	},

	updateOrganizationPasswordHashById: (id, hash) => {
		return db.query('UPDATE organizations SET password_hash = $2 WHERE id = $1', [id, hash])
	},

	updateOrganizationEmailById: (id, newEmail) => {
		return db.query(`UPDATE organizations
			SET email = $2
			WHERE id = $1`, [id, newEmail])
	},

	updateOrganizationProfile: (id, details) => {
		return db.query(`UPDATE organizations
			SET contact_name = $2,
			contact_number = $3,
			organization_name = $4,
			address = $5,
			apt_suite_bldg = $6,
			city = $7,
			state = $8,
			postcode = $9,
			country = $10
			WHERE id = $1`,
			[ id,
			details.contact_name,
			details.contact_number,
			details.organization_name,
			details.address,
			details.apt_suite_bldg,
			details.city,
			details.state,
			details.postcode,
			details.country])
	},

	updateOrganizationImage: (id, imageUrl) => {
		return db.query(`UPDATE organizations
			set profile_image_url = $2
			WHERE id = $1`, [id, imageUrl])
	},

	updateOrganizationAbout: (id, about) => {
		return db.query(`UPDATE organizations
			SET about = $2
			WHERE id = $1`, [id, about])
	},

	deleteOrganization: (id) => {
		return db.query(`DELETE FROM organizations WHERE id = $1`, [id])
	},

	insertOrganization: (details) => {
		return db.query(`INSERT INTO organizations (
			contact_name, 
			contact_number,
			organization_name,
			about,
			address,
			apt_suite_bldg,
			city,
			state,
			postcode,
			country,
			abn,
			email,
			password_hash)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, 
			[ details.contact_name,
			details.contact_number,
			details.organization_name,
			details.about,
			details.address,
			details.apt_suite_bldg,
			details.city,
			details.state,
			details.postcode,
			details.country,
			details.abn,
			details.email.toLowerCase(),
			details.password ])
	},

	insertNeed: (id, need) => {
		return db.query(`INSERT INTO needs (
			organization_id,
			name,
			region,
			category,
			details,
			requirements,
			need_image_url
			) VALUES ($1, $2, $3, $4, $5, $6, $7) 
			RETURNING id`,
			[ id,
			need.name,
			need.region,
			need.category,
			need.details,
			need.requirements,
			need.uuid ? `https://s3.ap-southeast-2.amazonaws.com/ahelpinghandimagebucket/${need.uuid}` : ''])
	},

	updateNeed: (id, need) => {
		console.log(need)

		if (need.need_image_url) {
			return db.query(`UPDATE needs SET 
				name = $2,
				details = $3,
				requirements = $4,
				region = $5,
				category = $6,
				need_image_url = $7
				WHERE id = $1`, 
				[id, 
				need.name, 
				need.details,
				need.requirements,
				need.region,
				need.category,
				need.need_image_url])
		} else {
			return db.query(`UPDATE needs SET 
				name = $2,
				details = $3,
				requirements = $4,
				region = $5,
				category = $6
				WHERE id = $1`, 
				[id, 
				need.name, 
				need.details,
				need.requirements,
				need.region,
				need.category])
		}
	},

	deleteNeed: (id) => {
		return db.query(`DELETE FROM needs WHERE id = $1`, [id])
	},

	setNeedFulfilled: (id) => {
		return db.query(`UPDATE needs SET 
			fulfilled = True, 
			fulfilled_at = NOW() 
			WHERE id = $1`, [id])
	},

	setNeedContacted: (id) => {
		return db.query(`UPDATE needs SET 
		contacted = True, 
		last_contacted_at = NOW() 
		WHERE id = $1`, [id])
	},

	getNeed: (id) => {
		return db.query(`SELECT 
			needs.id,
			needs.major,
			needs.region,
			needs.organization_id,
			needs.name,
			needs.details,
			needs.requirements,
			needs.created_at,
			needs.category,
			needs.need_image_url,
			needs.fulfilled,
			to_char(needs.fulfilled_at, 'DD Mon YYYY') AS fulfilled_at,
			needs.contacted,
			organizations.organization_name, 
			organizations.profile_image_url,
			organizations.contact_name
			FROM needs 
			JOIN organizations ON needs.organization_id = organizations.id
			WHERE needs.id = $1`, [id])
	},

	getNeedsByOrgId: (id) => {
		return db.query(`SELECT 
			needs.id,
			needs.major,
			needs.region,
			needs.organization_id,
			needs.name,
			needs.details,
			needs.requirements,
			needs.created_at,
			needs.category,
			needs.need_image_url,
			needs.fulfilled,
			needs.contacted,
			to_char(needs.fulfilled_at, 'DD Mon YYYY') AS fulfilled_at,
			organizations.organization_name, organizations.profile_image_url
			FROM needs 
			JOIN organizations ON needs.organization_id = organizations.id
			WHERE organizations.id = $1`, [id])
	},

	getCurrentNeedsByRegion: (region) => {
		return db.query(`SELECT 
			needs.id,
			needs.major,
			needs.region,
			needs.organization_id,
			needs.name,
			needs.details,
			needs.requirements,
			needs.created_at,
			needs.category,
			needs.need_image_url,
			needs.contacted,
			to_char(needs.fulfilled_at, 'DD Mon YYYY') AS fulfilled_at,
			organizations.organization_name
			FROM needs 
			JOIN organizations ON needs.organization_id = organizations.id
			WHERE needs.region = $1 AND needs.fulfilled != True AND needs.approved = True
			ORDER BY needs.major DESC`, [region])
	},



	/* Password and email reset */

	insertEmailChange: (uuid, id, newEmail) => {
		return db.query(`INSERT INTO email_changes (
			uuid,
			new_email,
			organization_id)
			VALUES ($1, $2, $3)`, [uuid, newEmail, id])
	},

	insertPasswordReset: (uuid, id) => {
		return db.query(`INSERT INTO password_resets (
		uuid,
		organization_id)
		VALUES ($1, $2)`, [uuid, id])
	},

	completePasswordReset: async (uuid, newPassword) => {
		let client = await db.getClient()

		let result = await client.query('SELECT * FROM password_resets WHERE uuid = $1 AND expiry > NOW()', [uuid])
		if (!result.rows[0]) { 
			client.release()
			throw(MESSAGES.ERROR.PASSWORD_RESET_EXPIRED_OR_NOT_EXIST)
		}

		let orgId = result.rows[0].organization_id	

		// Validate that new password is not the same as the previous one
		let existingHash = await module.exports.getOrganizationPasswordHashById(orgId)
		let sameAsPrevious = await bcrypt.compare(newPassword, existingHash.rows[0].password_hash)

		if (sameAsPrevious) {
			client.release()
			throw(MESSAGES.ERROR.PASSWORD_SAME_AS_PREVIOUS)
		}

		let newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

		let _result = await client.query('UPDATE organizations SET password_hash = $2 WHERE id = $1', [orgId, newPasswordHash])
		if (!result.rowCount == 1) {
			client.release()
			throw(MESSAGES.ERROR.COULD_NOT_COMPLETE_PASSWORD_RESET)
		}

		let __result = await client.query('UPDATE password_resets SET uuid = NULL where uuid = $1', [uuid])
		if (!__result.rowCount == 1) { 
			// If it can't be nullified, it might be done already.
			client.release()
			// throw(MESSAGES.ERROR.GENERIC)
		}

		client.release()
	},

	confirmUpdateEmail: async (uuid) => {
		let client = await db.getClient()

		let result = await client.query(`SELECT * FROM email_changes WHERE uuid = $1 AND expiry > NOW()`, [uuid])
		if (!result.rows[0]) { 
			client.release()
			throw('Couldnt find email_changes entry')
		}

		let _result = await client.query('UPDATE email_changes SET uuid = NULL WHERE uuid = $1', [uuid])

		if (!_result.rowCount == 1) {
			client.release()
			throw('couldnt nullify email_changes entry')		
		}

		let orgId = result.rows[0].organization_id
		let newEmail = result.rows[0].new_email

		let __result = await client.query(`UPDATE organizations SET email = $2 WHERE id = $1`, [orgId, newEmail])

		if (!__result.rowCount == 1) {
			client.release()
			throw('couldnt update org with new email')
		}

		client.release()
	},




	/* Reminders */

	// Add fulfilled need reminder
	// need_id has a UNIQUE constraint
	// And will not be overwritten by subsequent fulfilments
	addFulfilledNeedReminder: (needId, orgId) => {
		return db.query(`INSERT INTO fulfilled_need_reminders 
		(need_id, organization_id, target_date) 
		VALUES ($1, $2, NOW() + INTERVAL '1 minute') 
		ON CONFLICT DO NOTHING`, [needId, orgId])
	},

	// Extends fulfilled_need_reminder target_date, and sets reminder_sent back to false
	extendNeed: async (needId) => {
		let client = await db.getClient()

		// Have to check if the fulfilled_need_reminder is actual valid for extension
		let results = await db.query('SELECT * from fulfilled_need_reminders WHERE reminder_sent = True AND need_id = $1', [needId]) 
		if (!results.rows[0]) {
			client.release()
			throw("Need is not valid for extension")
		}

		await db.query(`UPDATE fulfilled_need_reminders SET reminder_sent = False, target_date = NOW() + Interval '1 minute'`)
		client.release()
	},


	/* Misc */

	getImpacts: async () => {
		return db.query('SELECT * FROM impacts ORDER BY created_at')
	},

	getSupporters: async () => {
		return db.query('SELECT * FROM supporters')
	}

}



/*
	EXTENSION:

		"uuid-ossp"
			select * from pg_available_extensions
			CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
			SELECT uuid_generate_v1();

	TABLES:
	
	CREATE TABLE total_needs_fulfilled (
		count INTEGER NOT NULL DEFAULT 0
	)

	CREATE TABLE supporters (
		list TEXT
	)

	CREATE TABLE impacts (
		id UUID DEFAULT uuid_generate_v1() PRIMARY KEY,
		title VARCHAR(200),
		content TEXT,
		impact_image_urls TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE organizations (
		id UUID DEFAULT uuid_generate_v1() PRIMARY KEY,
		approved BOOL NOT NULL DEFAULT False,
		contact_name VARCHAR(100) NOT NULL,
		contact_number VARCHAR(30) NOT NULL,
		organization_name VARCHAR(200) NOT NULL,
		about TEXT,
		address VARCHAR(200) NOT NULL,
		apt_suite_bldg VARCHAR(50),
		city VARCHAR(100) NOT NULL,
		state VARCHAR(3) NOT NULL,
		postcode VARCHAR(4) NOT NULL,
		country VARCHAR(50) NOT NULL,
		abn BIGINT NOT NULL,
		email VARCHAR(200) NOT NULL,
		password_hash VARCHAR(200) NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		profile_image_url VARCHAR(200)
	);

	CREATE TABLE admins (
		id UUID DEFAULT uuid_generate_v1() PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(200) NOT NULL,
		password_hash VARCHAR(200) NOT NULL
	);

	CREATE TABLE password_resets (
		organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		uuid UUID,
		expiry TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '15 minutes'
	);

	CREATE TABLE email_changes (
		organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		uuid UUID,
		new_email VARCHAR(200) NOT NULL,
		expiry TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '15 minutes'
	);

	CREATE TABLE needs (
		id UUID DEFAULT uuid_generate_v1() PRIMARY KEY,
		major BOOL NOT NULL DEFAULT false,
		region VARCHAR(30) NOT NULL,
		category VARCHAR(50) NOT NULL,
		organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		name VARCHAR(300) NOT NULL,
		details TEXT NOT NULL,
		requirements TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		need_image_url VARCHAR(200) DEFAULT NULL,
		fulfilled BOOL NOT NULL DEFAULT false,
		fulfilled_at TIMESTAMPTZ,
		approved BOOL NOT NULL DEFAULT false,
		contacted BOOL NOT NULL DEFAULT false,
		last_contacted_at TIMESTAMPTZ
	);

	CREATE TABLE fulfilled_need_reminders (
		need_id UUID REFERENCES needs(id) ON DELETE CASCADE NOT NULL UNIQUE,
		organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		target_date TIMESTAMPTZ NOT NULL,
		reminder_sent BOOLEAN DEFAULT false
	)

*/