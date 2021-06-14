const db = require('./index.js')
const bcrypt = require('bcrypt')
const saltRounds = 10

/*
	NOTES:
	We pass params to queries as a separate array, because ..
	.. the library will check against SQL injections.
*/

module.exports = {

	getAdminByEmail: (email) => {
		return db.query(`SELECT * FROM admins WHERE email = $1`, [email])
	},

	insertAdmin: (details) => {
		/* Should put some extra layer of security here */
	}, 

	getOrganizationProfileById: (id) => {
		return db.query(`SELECT 
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
			details.email,
			details.password ])
	},

	insertNeed: (id, need) => {
		return db.query(`INSERT INTO needs (
			organization_id,
			name,
			region,
			details,
			requirements
			) VALUES ($1, $2, $3, $4, $5) 
			RETURNING id`,
			[ id,
			need.name,
			need.region,
			need.details,
			need.requirements])
	},

	updateNeed: (id, need) => {
		return db.query(`UPDATE needs SET 
			name = $2,
			details = $3,
			requirements = $4,
			region = $5, 
			WHERE id = $1`, 
			[id, 
			need.name, 
			need.details,
			need.requirements,
			need.region])
	},

	deleteNeed: (id) => {
		return db.query(`DELETE FROM needs WHERE id = $1`, [id])
	},

	getNeed: (id) => {
		return db.query(`SELECT * FROM needs WHERE id = $1`, [id])
	},

	getNeedsByOrgId: (id) => {
		return db.query('SELECT * FROM needs WHERE organization_id = $1', [id])
	},

	getCurrentNeeds: (region) => {
		return db.query(`SELECT * FROM needs WHERE region = $1`, [region])
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
			throw('Couldnt find password_resets entry')
		}

		let orgId = result.rows[0].organization_id	
		let newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

		let _result = await client.query('UPDATE organizations SET password_hash = $2 WHERE id = $1', [orgId, newPasswordHash])
		if (!result.rowCount == 1) {
			client.release()
			throw('couldnt update organization password hash')
		}

		let __result = await client.query('UPDATE password_resets SET uuid = NULL where uuid = $1', [uuid])
		if (!__result.rowCount == 1) { 
			client.release()
			throw('couldnt nullify password_resets entry')
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
	}

}



/*
	TABLES:



	CREATE TABLE organizations (
		id SERiAL PRIMARY KEY,
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
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(200) NOT NULL,
		password_hash VARCHAR(200) NOT NULL
	);

	CREATE TABLE password_resets (
		organization_id INT REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		uuid UUID,
		expiry TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '15 minutes'
	);

	CREATE TABLE email_changes (
		organization_id INT REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		uuid UUID,
		new_email VARCHAR(200) NOT NULL,
		expiry TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '15 minutes'
	);

	CREATE TABLE needs (
		id SERIAL PRIMARY KEY,
		major BOOL NOT NULL DEFAULT false,
		region VARCHAR(30) NOT NULL,
		organization_id INT REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
		name VARCHAR(300) NOT NULL,
		details TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

*/