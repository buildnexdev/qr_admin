/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/export */
export const relationships = ['Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Other'];

export type ContactFormValues = {
	employeePhone: string;
	alternatePhone: string;
	employeeEmailID: string;
	alternateEmailID: string;
	employeePassword: string;
	emergencyContact1Name: string;
	emergencyContact1Number: string;
	emergencyContact1Relationship: string;
	emergencyContact2Name: string;
	emergencyContact2Number: string;
	emergencyContact2Relationship: string;
	empBackEndID: string;
};

const MIN_PASSWORD_LEN = 6;

const normalizePhoneDigits = (v: string) => (v || '').replace(/\D/g, '');
const normalizeEmail = (v: string) => (v || '').trim().toLowerCase();

const PHONE_FIELDS: (keyof ContactFormValues)[] = [
	'employeePhone',
	'alternatePhone',
	'emergencyContact1Number',
	'emergencyContact2Number',
];

// VALIDATE EMPLOYEE CONTACT DETAILS
const validateEmployeeContactDetails = (values: ContactFormValues) => {
	const errors: Partial<ContactFormValues> = {};
	if (!values.employeePhone) {
		errors.employeePhone = 'Required';
	}
	if (!values.employeeEmailID) {
		errors.employeeEmailID = 'Required';
	}
	if (!values.alternatePhone) {
		errors.alternatePhone = 'Required';
	}
	if (!values.alternateEmailID) {
		errors.alternateEmailID = 'Required';
	}
	if (!values.employeePassword || !String(values.employeePassword).trim()) {
		errors.employeePassword = 'Required';
	} else if (String(values.employeePassword).length < MIN_PASSWORD_LEN) {
		errors.employeePassword = `At least ${MIN_PASSWORD_LEN} characters`;
	}
	if (!values.emergencyContact1Name) {
		errors.emergencyContact1Name = 'Required';
	}
	if (!values.emergencyContact1Number) {
		errors.emergencyContact1Number = 'Required';
	}
	if (!values.emergencyContact1Relationship) {
		errors.emergencyContact1Relationship = 'Required';
	}
	if (!values.emergencyContact2Name) {
		errors.emergencyContact2Name = 'Required';
	}
	if (!values.emergencyContact2Number) {
		errors.emergencyContact2Number = 'Required';
	}
	if (!values.emergencyContact2Relationship) {
		errors.emergencyContact2Relationship = 'Required';
	}

	const phoneNorms = PHONE_FIELDS.map((key) => ({
		key,
		norm: normalizePhoneDigits(String(values[key] ?? '')),
	}));
	for (const { key, norm } of phoneNorms) {
		if (!norm) continue;
		const isDup = phoneNorms.some((o) => o.key !== key && o.norm && o.norm === norm);
		if (isDup) {
			errors[key] = 'Phone number must be unique';
		}
	}

	const primaryEmail = normalizeEmail(values.employeeEmailID);
	const alternateEmail = normalizeEmail(values.alternateEmailID);
	if (primaryEmail && alternateEmail && primaryEmail === alternateEmail) {
		errors.employeeEmailID = 'Must be different from alternate email';
		errors.alternateEmailID = 'Must be different from primary email';
	}

	const rel1 = String(values.emergencyContact1Relationship ?? '').trim();
	const rel2 = String(values.emergencyContact2Relationship ?? '').trim();
	if (rel1 && rel2 && rel1 === rel2) {
		errors.emergencyContact1Relationship = 'Relationship must be unique for each contact';
		errors.emergencyContact2Relationship = 'Relationship must be unique for each contact';
	}

	return errors;
};
export default validateEmployeeContactDetails;
