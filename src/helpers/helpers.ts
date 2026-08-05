export function test() {
	return null;
}

export function getOS() {
	const { userAgent } = window.navigator;
	const { platform } = window.navigator;
	const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
	const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
	const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
	let os = null;

	if (macosPlatforms.indexOf(platform) !== -1) {
		os = 'MacOS';
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		os = 'iOS';
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		os = 'Windows';
	} else if (/Android/.test(userAgent)) {
		os = 'Android';
	} else if (!os && /Linux/.test(platform)) {
		os = 'Linux';
	}

	// @ts-ignore
	document.documentElement.setAttribute('os', os);
	return os;
}

export const hasNotch = () => {
	/**
	 * For storybook test
	 */
	const storybook = window.location !== window.parent.location;
	// @ts-ignore
	const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
	const aspect = window.screen.width / window.screen.height;
	const aspectFrame = window.innerWidth / window.innerHeight;
	return (
		(iPhone && aspect.toFixed(3) === '0.462') ||
		(storybook && aspectFrame.toFixed(3) === '0.462')
	);
};

export const mergeRefs = (refs: any[]) => {
	return (value: any) => {
		refs.forEach((ref) => {
			if (typeof ref === 'function') {
				ref(value);
			} else if (ref != null) {
				ref.current = value;
			}
		});
	};
};

export const randomColor = () => {
	const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'danger'];

	const color = Math.floor(Math.random() * colors.length);

	return colors[color];
};

export const priceFormat = (price: number) => {
	return price.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export const average = (array: any[]) => array.reduce((a, b) => a + b) / array.length;

export const percent = (value1: number, value2: number) =>
	Number(((value1 / value2 - 1) * 100).toFixed(2));

export const getFirstLetter = (text: string, letterCount = 2): string =>
	// @ts-ignore
	text
		.toUpperCase()
		.match(/\b(\w)/g)
		.join('')
		.substring(0, letterCount);

export const debounce = (func: (arg0: any) => void, wait = 1000) => {
	let timeout: string | number | NodeJS.Timeout | undefined;

	return function executedFunction(...args: any[]) {
		const later = () => {
			clearTimeout(timeout);
			// @ts-ignore
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};


function numberToWords (num: number){  
	const ones = [
		'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
		'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
		'Eighteen', 'Nineteen'
	];
	const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
	const scales = ['', 'Hundred', 'Thousand', 'Lakh', 'Crore', 'Arab', 'Kharab']; // Added 'Kharab' for larger values

	const getBelowThousand = (n: number): string => {
		let str = '';
		if (n > 99) {
			str += ones[Math.floor(n / 100)] + ' Hundred ';
			n %= 100;
		}
		if (n > 19) {
			str += tens[Math.floor(n / 10)] + ' ';
			n %= 10;
		}
		if (n > 0) {
			str += ones[n] + ' ';
		}
		return str.trim();
	};

	if (num === 0) return 'Zero Rupees';

	let word = '';

	// Handle Kharab (10^12) and below
	const kharabPart = Math.floor(num / 100000000000);
	num %= 100000000000;

	// Handle Arab (10^9) and below
	const arabPart = Math.floor(num / 1000000000);
	num %= 1000000000;

	// Handle Crore (10^7) and below
	const crorePart = Math.floor(num / 10000000);
	num %= 10000000;

	// Handle Lakh (10^5) and below
	const lakhPart = Math.floor(num / 100000);
	num %= 100000;

	// Handle Thousand (10^3) and below
	const thousandPart = Math.floor(num / 1000);
	num %= 1000;

	// Handle remaining below thousand
	const belowThousandPart = num;

	// Constructing the word representation
	if (kharabPart > 0) {
		word += getBelowThousand(kharabPart) + ' Kharab ';
	}
	// if (arabPart > 0) {
	// 	word += getBelowThousand(arabPart) + ' Arab ';
	// }

	// Check if the number is greater than or equal to 100 crore
	if (crorePart > 0 || arabPart > 0) {
		const totalCrores = arabPart * 100 + crorePart; // Calculate total crores
		if (totalCrores >= 100) {
			word += getBelowThousand(totalCrores) + ' Crore '; // Convert total crores to words
		} else if (crorePart > 0) {
				word += getBelowThousand(crorePart) + ' Crore ';
			}
	// eslint-disable-next-line no-dupe-else-if
	} else if (crorePart > 0) {
			word += getBelowThousand(crorePart) + ' Crore ';
		}

	if (lakhPart > 0) {
		word += getBelowThousand(lakhPart) + ' Lakh ';
	}
	if (thousandPart > 0) {
		word += getBelowThousand(thousandPart) + ' Thousand ';
	}
	if (belowThousandPart > 0) {
		word += getBelowThousand(belowThousandPart);
	}

	return `${word.trim()} Rupees`.trim();
};

export const inputformatINR = (value: any) => {
	let amount: any = '';
	let words = '';
	if (value !== '') {
		// Remove commas and non-numeric characters
		const removeNonNumaric = value.replace(/,/g, '').replace(/\D/g, '');
		// const removeNonNumaric = value.replaceAll(",", "");

		// eslint-disable-next-line radix
		amount = parseFloat(removeNonNumaric).toLocaleString('en-IN');
		words = `${numberToWords(removeNonNumaric)} Rupees`;
	}
	return [amount, words];
};

export const removeCamma =  (givenVal: any) => {
	return givenVal.replace(/,/g, '').replace(/\D/g, '');
}