import { config } from '../config/config';
import { AstroObjectState } from '../interfaces/AstroObjectState';


export class ApiClient {
	
	constructor() {
		console.log(`${config.apiUrl}/planet-state`);
	}

	async getEphemeris(time: Date, astroIdList: string[]): Promise<string[]> {
		console.log(astroIdList)
		return astroIdList
	}
}
