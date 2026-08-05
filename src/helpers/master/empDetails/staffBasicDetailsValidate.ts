/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/naming-convention */
export interface empBasicDetailsIValues {
	empID: string;
	employeeName: string;
	dateOfBirth: string;
	employeeGender: string;
	maritalStatus: string;
	bloodGroup: string;
	isFatherApplicable: boolean;
	fatherName: string;
	isMotherApplicable: boolean;
	motherName: string;
	spouseName: string;
	spouseDob: string;
	marriageAnniversary: string;
	employeePhone: string;
	empBackEndID: string;
}

/** Parses DOB (YYYY-MM-DD from date input or other parseable string) and returns age in full years, or null if invalid. */
function getAgeFromBirthDate(dob: string): number | null {
	const trimmed = dob.trim();
	const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
	let birth: Date;
	if (iso) {
		const y = Number(iso[1]);
		const m = Number(iso[2]) - 1;
		const d = Number(iso[3]);
		birth = new Date(y, m, d);
		if (birth.getFullYear() !== y || birth.getMonth() !== m || birth.getDate() !== d) {
			return null;
		}
	} else {
		birth = new Date(trimmed);
		if (Number.isNaN(birth.getTime())) {
			return null;
		}
	}
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age;
}

// VALIDATE EMPLOYEE BASIC DETAILS
const validateEmployeeBasicDetails = (values: empBasicDetailsIValues) => {
	const errors: Partial<empBasicDetailsIValues> = {};
	if (!values.empID) {
		errors.empID = 'Required';
	}
	if (!values.employeeName) {
		errors.employeeName = 'Required';
	}
	if (!values.dateOfBirth) {
		errors.dateOfBirth = 'Required';
	} else {
		const age = getAgeFromBirthDate(values.dateOfBirth);
		if (age === null) {
			errors.dateOfBirth = 'Invalid date';
		} else if (age < 18) {
			errors.dateOfBirth = 'Employee must be at least 18 years old';
		}
	}
	if (!values.employeeGender) {
		errors.employeeGender = 'Required';
	}
	if (!values.maritalStatus) {
		errors.maritalStatus = 'Required';
	}
	if (!values.bloodGroup) {
		errors.bloodGroup = 'Required';
	}
	if (!values.fatherName) {
		errors.fatherName = 'Required';
	}
	if (!values.motherName) {
		errors.motherName = 'Required';
	} else if (values.isMotherApplicable && !values.motherName.trim()) {
		errors.motherName = 'Required';
	} else if (!values.employeePhone && values.motherName.trim()) {
		errors.motherName = 'Should be empty if not applicable';
	}
	const phone = String(values.employeePhone ?? '').trim();
	if (!phone) {
		errors.employeePhone = 'Required';
	} else if (!/^\d{10}$/.test(phone)) {
		errors.employeePhone = 'Enter exactly 10 digits (numbers only, no spaces or symbols)';
	}
	return errors;
};
export default validateEmployeeBasicDetails;
