/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/naming-convention */
export interface empBasicDetailsOfficalIValues {
	joiningDate: string;
	confirmationDate: string;
	employmentType: string;
	workMode: string;
	employeeStatus: string;
	designation: string;
	branchName: string;
	sectionName: string;
	managerID: string;
	checkInTime: string;
	checkOutTime: string;
	hasApprovalAuthority: string;
	isActive: string;
	empBackEndID: string;
}

export const sectionOptions = ['Operation', 'Collection'];
export const managerOptions = ['John Doe', 'Jane Smith'];

// VALIDATE EMPLOYEE BASIC DETAILS
const validateEmployeeOfficalDetails = (values: empBasicDetailsOfficalIValues) => {
	const errors: Partial<empBasicDetailsOfficalIValues> = {};
	if (!values.joiningDate) {
		errors.joiningDate = 'Required';
	}
	if (!values.confirmationDate) {
		errors.confirmationDate = 'Required';
	}
	return errors;
};
export default validateEmployeeOfficalDetails;
