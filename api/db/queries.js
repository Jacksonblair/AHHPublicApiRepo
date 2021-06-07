const db = require('./index.js')

/*
	NOTES:
	We pass params to queries as a separate array, because ..
	.. the library will check against SQL injections.
*/

module.exports = {

	getAdminByEmail: (email, callback) => {
		db.query(`SELECT * FROM admins WHERE email = $1`, [email], callback)
	},

	insertAdmin: (details, callback) => {
		/* Should put some extra layer of security here */
	}, 

	getOrganizationProfileById: (id, callback) => {
		db.query(`SELECT 
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
		FROM organizations WHERE id = $1`, [id], callback)
	},

	getOrganizationByEmail: (email, callback) => {
		db.query(`SELECT * FROM organizations WHERE email = $1`, [email], callback)
	},

	updateOrganizationProfile: (id, details, callback) => {
		db.query(`UPDATE organizations
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
			details.country], callback
		)
	},

	updateOrganizationImage: (id, imageUrl, callback) => {
		db.query(`UPDATE organizations
			set profile_image_url = $2
			WHERE id = $1`, [id, imageUrl], callback )
	},

	updateOrganizationAbout: (id, about, callback) => {
		db.query(`UPDATE organizations
			SET about = $2
			WHERE id = $1`, [id, about], callback )
	},

	insertOrganization: (details, callback) => {
		db.query(`INSERT INTO organizations (
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
			details.password ], callback
		)
	},

	insertNeed: (orgId, details, callback) => {
		console.log("INSERTING")
		console.log(details)

		db.query(`INSERT INTO needs (
			organization_id,
			name,
			details
			) VALUES ($1, $2, $3) 
			RETURNING id`,
			[ orgId,
			details.name,
			details.details], callback
		)
	},

	getNeed: (needId, callback) => {
		db.query(`SELECT * FROM needs WHERE id = $1`, [needId], callback)
	},

	getNeedsByOrgId: (orgId, callback) => {
		db.query('SELECT * FROM needs WHERE organization_id = $1', [orgId], callback)
	},

	getCurrentNeeds: (callback) => {
		db.query('SELECT * FROM needs', [], callback)
	}

}



/*
	TABLES:

	CREATE TABLE needs (
		id SERIAL PRIMARY KEY,
		organization_id INT REFERENCES organizations(id) NOT NULL,
		name VARCHAR(300) NOT NULL,
		details TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE admins (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(200) NOT NULL,
		password_hash VARCHAR(200) NOT NULL
	)

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
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

*/