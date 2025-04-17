import { config } from '../config/config';
import { AstroObjectState } from '../interfaces/AstroObjectState';
import { addLeadingZeroes } from '../utils/api-utils';



export class ApiClient {
	
	private _baseApiUrl: string;

	constructor() {
		this._baseApiUrl = `${config.apiUrl}`;
	}

	// Calls Api to get the positions and velocities of AstroObjects at a certain time. Returns a dictionary where the key is the AstroObject Id and the value has the position and velocity data
	async getEphemeris(dateTime: Date, astroIdList: string[]): Promise<Record<string, AstroObjectState>> {
		let ephemerisDict: Record<string, AstroObjectState> = {};
		const dateTimeStr = this._formatDateTime(dateTime);
		
		// Calls the Api for each AstroObject Id
		for (const id of astroIdList) {
			let response = await fetch(`${this._baseApiUrl}/planet-state?id=${id}&timestamp=${dateTimeStr}`, { method: 'GET'});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
				
			let data: AstroObjectState = await response.json();
			ephemerisDict[id] = data;
		}
		return ephemerisDict;
	}

	// Formats Date object into string of format YYYY-MM-DD-HH:mm
	private _formatDateTime(dateTime: Date): string {
		const year = addLeadingZeroes(String(dateTime.getFullYear()), 4);
		const month = addLeadingZeroes(String(dateTime.getMonth()), 2);
		const day = addLeadingZeroes(String(dateTime.getDate()), 2);
		const hour = addLeadingZeroes(String(dateTime.getHours()), 2);
		const minute = addLeadingZeroes(String(dateTime.getMinutes()), 2);
		
		return `${year}-${month}-${day}-${hour}:${minute}`;
	}
}
