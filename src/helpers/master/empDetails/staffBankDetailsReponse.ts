export interface BankFormValues {
	ifscCode: string;
	bankName: string;
	accountHolderName: string;
	accountNumber: string;
	passbookFile: File | null;
	passbookUpload: string;
	empBackEndID: string;
};

/** IFSC: positions 1-4 bank code (A-Z), 5th reserved 0, 6-11 branch (A-Z or 0-9). */
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const normalizeIfsc = (v: string) => String(v ?? '').trim().toUpperCase();

// VALIDATE EMPLOYEE BANK DETAILS
const validateEmployeeBankDetails = (values: BankFormValues) => {
	const errors: Partial<BankFormValues> = {};
	const ifsc = normalizeIfsc(values.ifscCode);
	if (!ifsc) {
		errors.ifscCode = 'Required';
	} else if (ifsc.length !== 11) {
		errors.ifscCode = 'IFSC must be exactly 11 characters';
	} else if (!IFSC_REGEX.test(ifsc)) {
		errors.ifscCode =
			'Invalid IFSC: characters 1-4 letters (bank name), 5th must be 0, characters 6-11 branch code (letters or numbers)';
	}
	if (!values.bankName) {
		errors.bankName = 'Required';
	}
	if (!values.accountHolderName) {
		errors.accountHolderName = 'Required';
	}
	if (!values.accountNumber) {
		errors.accountNumber = 'Required';
	}
	return errors;
};
export default validateEmployeeBankDetails;