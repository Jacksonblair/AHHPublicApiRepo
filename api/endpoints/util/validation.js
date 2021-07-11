const sanitizeHtml = require('sanitize-html')

module.exports = {

	/* 
		Validators check but dont send error messages. We just say if its invalid or not.
		Details about the invalidity are only shown on the client.
	*/


	validateOrganization: (values) => {

		console.log(values)

		// Sanitize all fields
		for (let value in values) {
			value = sanitizeHtml(value)
		}

		if (!isEmailValid(values.email)) return false
		if (!module.exports.validatePassword(values.password)) return false
		if (!values.contact_name) return false
		if (!values.contact_number) return false
		// TODO: Regex for contact_number? 
		if (!values.organization_name) return false
		if (!values.address) return false
		if (!values.city) return false
		if (!values.state) return false
		if (!["QLD", "NSW", "VIC", "TAS", "SA", "NT", "WA"].includes(values.state)) return false
		if (!values.postcode) return false
		let re = new RegExp('^(0[289][0-9]{2})$|^([1-9][0-9]{3})$')
		if (!re.test(values.postcode)) return false
		if (!values.country) return false
		if (values.tos != 'true') return false
		if (!values.abn) return false
		// Basic regex for validating ABN. Just checks digit length. Does not check real validity
		// https://abr.business.gov.au/Help/AbnFormat
		re = new RegExp('^([0-9]){11}$')
		if (!re.test(values.abn)) return false

		return true
	},

	validateUpdateOrganization: (values) => {

		// Sanitize all fields
		for (let value in values) {
			values[value] = sanitizeHtml(values[value])
		}

		if (!values.organization_name) return false
		if (!values.contact_name) return false
		if (!values.contact_number) return false
		if (!values.address) return false
		if (!values.city) return false
		if (!values.state) return false
		if (!["QLD", "NSW", "VIC", "TAS", "SA", "NT", "WA"].includes(values.state)) return false
		if (!values.postcode) return false
		let re = new RegExp('^(0[289][0-9]{2})$|^([1-9][0-9]{3})$')
		if (!re.test(values.postcode))return false
		if (!values.country) return false
		// Basic regex for validating ABN. Just checks digit length. Does not check real validity
		// https://abr.business.gov.au/Help/AbnFormat
		re = new RegExp('^([0-9]){11}$')
		if (!re.test(values.abn)) return false
			
		return true
	},
	
	validatePassword: (password) => {
		if (!password) return false
		if (password.length < 6) return false
		return true
	},

	validateEmail: (email) => {
		return isEmailValid(email)
	},

	validateNeed: (need) => {

		console.log(need)

		// Sanitize all fields
		for (let value in need) {
			need[value] = sanitizeHtml(need[value])
		}

		if (!need.name) return false
		if (!need.name.length > 35) return false
		if (!need.details) return false
		if (!need.region) return false
		if (!["geelong", "corangamite", "warnambool"].includes(need.region.toLowerCase())) return false
		if (!["educational", "living", "sports-and-social", "parenting-and-baby", "job-help-or-mentoring"].includes(need.category.toLowerCase())) return false
		return true
	},

	validateFulfilment: (details) => {

		// Sanitize all fields
		for (let value in details) {
			details[value] = sanitizeHtml(details[value])
		}

		// TODO: then validate


		return true
	},

	/*

	To verify an ABN:

	Subtract 1 from the first (left-most) digit of the ABN to give a new 11 digit number
	Multiply each of the digits in this new number by a "weighting factor" based on its position as shown in the table below
	Sum the resulting 11 products
	Divide the sum total by 89, noting the remainder
	If the remainder is zero the number is a valid ABN
	
	*/
}

function isEmailValid(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}