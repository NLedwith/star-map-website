import { vec3 } from "gl-matrix";
import { AstroObject } from "./AstroObject";


// Gravitational constant in m^3*kg^-1*s^-2
const G = (6.6743 * (10**-11));

// This handles physics for an entire Astronomical system
// Examples would be The Solar System and Alpha Centauri.
export class AstroSystem {

	constructor(public _astroObjectList: AstroObject[]) { }

	// Calculates new acceleration values due to gravity and computes new positions of each astro object in the system
	public updateAstroSystem(dt: number) {
		this._computeGravityVectors();
		for (const astroObject of this._astroObjectList) {
			astroObject.updatePhysics(dt);	
		}
	}

	private _computeGravityVectors() {
		
		// Zero out every AstroObject's acceleration
		for (const astroObject of this._astroObjectList) {
			vec3.zero(astroObject.acceleration);
		}

		// Recalculate the acceleration due to gravity for every AstroObject in the system
		// The invariant is that the gravity is completely calculated for every AstroObject to the left of i
		for (let i = 0; i < (this._astroObjectList.length - 1); i++) {
			for (let j = (i + 1); j < this._astroObjectList.length; j++) {
		
				let gravityAccelI = vec3.create();
				let gravityAccelJ = vec3.create();
					
				// Find directional vectors for the force of gravity between the 2 AstroObjects
				vec3.subtract(gravityAccelI, this._astroObjectList[j].position, this._astroObjectList[i].position);
				vec3.negate(gravityAccelJ, gravityAccelI);

				// Normalize the directional vectors
				vec3.normalize(gravityAccelI, gravityAccelI);
				vec3.normalize(gravityAccelJ, gravityAccelJ);

				const sqDistance = vec3.distance(this._astroObjectList[i].position, this._astroObjectList[j].position);

				// Calculate the magnitude of the force of gravity for both objects				
				const gMagI = (G * this._astroObjectList[j].mass) / (sqDistance**2);
				const gMagJ = (G * this._astroObjectList[i].mass) / (sqDistance**2);
				
				
				vec3.scale(gravityAccelI, gravityAccelI, gMagI);
				vec3.scale(gravityAccelJ, gravityAccelJ, gMagJ);

				// Compound acceleration due to gravity for both objects to get their overall acceleration
				vec3.add(this._astroObjectList[i].acceleration, this._astroObjectList[i].acceleration, gravityAccelI);
				vec3.add(this._astroObjectList[j].acceleration, this._astroObjectList[j].acceleration, gravityAccelJ);
			}
		}
	}

	public getDrawList(userPosition: vec3): AstroObject[] {
		let evalList: AstroObject[] = []
		for(let k = 0; k < this._astroObjectList.length; k++) {
			if(this._astroObjectList[k].name == "Sun") {
				evalList.push(this._astroObjectList[k])
			}
		}
		let retList: AstroObject[] = []
		while (evalList.length != 0) {
			retList.push(evalList.shift()!);
			let v = vec3.create()
			vec3.scale(v, retList[retList.length-1].position, 10**-9)
			if (retList[retList.length-1].systemSpace > vec3.distance(userPosition, v)) {
				for(let i = 0; i < this._astroObjectList.length; i++) {
					for(let j = 0; j < retList[retList.length-1].subsystem.length; j++) {
						if (retList[retList.length-1].subsystem[j] == this._astroObjectList[i].name) {
							evalList.push(this._astroObjectList[i])
						}
					}
				}
			}
		}
		console.log(retList)
		return retList;
	}
}
