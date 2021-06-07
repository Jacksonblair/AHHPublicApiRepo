// For hashing passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {

	validateOrganization: (details) => {
		// TODO: Verify org details
		return true
	},
	
	hashPassword: (password, callback) => {
		return bcrypt.hash(password, saltRounds)
	},

	compare: (password, hash) => {
		return bcrypt.compare(password, hash)
	}

	/*

	To verify an ABN:

	Subtract 1 from the first (left-most) digit of the ABN to give a new 11 digit number
	Multiply each of the digits in this new number by a "weighting factor" based on its position as shown in the table below
	Sum the resulting 11 products
	Divide the sum total by 89, noting the remainder
	If the remainder is zero the number is a valid ABN
	
	*/
}