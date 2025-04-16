
// Pads strings with leading zeroes to obtain a certain length. Primarily used for formatting the Date strings in Api calls.
export function addLeadingZeroes(str: string, targetLen: number): string {
	while (str.length < targetLen) {
		str = '0' + str;
	}
	return str;
}
