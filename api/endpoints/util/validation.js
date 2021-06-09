module.exports = {

	validateOrganization: (details) => {
		// TODO: Validate org details
		return true
	},
	
	validatePassword: (newPassword) => {
		// TODO: Validate password
		return true
	},

	validateEmail: (email) => {
		return true
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