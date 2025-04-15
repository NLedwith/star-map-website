import { config } from '../config/config';


export class ApiClient {
	
	constructor() {
		console.log(`${config.apiUrl}/planet-state`);
	}
/*
	async function getEphemeris(time: Date): Promise<AstroData[]> {
		let ids: string[] = ["10", "199", "299", "399", "499", "599", "699", "799", "899", "999"]
	}*/
}
