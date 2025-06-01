import { vec3 } from "gl-matrix";
import { AstroBody } from "./AstroBody";
import { Big, RoundingMode, MC } from "bigdecimal.js";
import * as bVec3 from "../utils/big-vec3";

// Gravitational constant in m^3*kg^-1*s^-2
const G = (6.6743 * (10**-11));

// This handles physics for an entire Astronomical system
// Examples would be The Solar System and Alpha Centauri.
export class AstroSystem {

	constructor(public _astroObjectList: AstroBody[]) { }

	// Calculates new acceleration values due to gravity and computes new positions of each astro object in the system
	public updateAstroSystem(dt: number) {
		
		this._computeGravityVectors();

		const tft = performance.now()
		for (const astroObject of this._astroObjectList) {
			astroObject.updatePhysics(dt);	
		}
	}

	private _computeGravityVectors() {
		
		// Zero out every AstroObject's acceleration
		for (const astroObject of this._astroObjectList) {
			bVec3.zero(astroObject.getAcceleration());
		}

		// Recalculate the acceleration due to gravity for every AstroObject in the system
		// The invariant is that the gravity is completely calculated for every AstroObject to the left of i
		for (let i = 0; i < (this._astroObjectList.length - 1); i++) {
			for (let j = (i + 1); j < this._astroObjectList.length; j++) {
		
				let gravityAccelI = bVec3.create();
				let gravityAccelJ = bVec3.create();
					
				// Find directional vectors for the force of gravity between the 2 AstroObjects
				bVec3.subtract(gravityAccelI, this._astroObjectList[j].getPosition(), this._astroObjectList[i].getPosition());
				bVec3.negate(gravityAccelJ, gravityAccelI);

				// Normalize the directional vectors
				bVec3.normalize(gravityAccelI, gravityAccelI);
				bVec3.normalize(gravityAccelJ, gravityAccelJ);

				const sqDistance = bVec3.distance(this._astroObjectList[i].getPosition(), this._astroObjectList[j].getPosition());
				

				// Calculate the magnitude of the force of gravity for both objects				
					
				const gMagI = (Big(G.toString()).multiply(this._astroObjectList[j].mass)).divide(sqDistance.pow(2), 20, RoundingMode.CEILING);
				const gMagJ = (Big(G.toString()).multiply(this._astroObjectList[i].mass)).divide(sqDistance.pow(2), 20, RoundingMode.CEILING);
				
				
				bVec3.scale(gravityAccelI, gravityAccelI, gMagI);
				bVec3.scale(gravityAccelJ, gravityAccelJ, gMagJ);

				// Compound acceleration due to gravity for both objects to get their overall acceleration
				bVec3.add(this._astroObjectList[i].getAcceleration(), this._astroObjectList[i].getAcceleration(), gravityAccelI);
				bVec3.add(this._astroObjectList[j].getAcceleration(), this._astroObjectList[j].getAcceleration(), gravityAccelJ);
			}
		}
	}

	public getDrawList(userPosition: vec3): AstroBody[] {
		/*let evalList: AstroObject[] = []
		for(let k = 0; k < this._astroObjectList.length; k++) {
			if(this._astroObjectList[k].name == "Sun") {
				evalList.push(this._astroObjectList[k])
			}
		}
		let retList: AstroObject[] = []
		while (evalList.length != 0) {
			retList.push(evalList.shift()!);
			let v = bVec3.create()
			bVec3.scale(v, retList[retList.length-1].position, Big("10").pow(-9, new MC(20)))
			if (Big((retList[retList.length-1].systemSpace).toString()).greaterThan(bVec3.distance(bVec3.fromValues(userPosition[0].toString(), userPosition[1].toString(), userPosition[2].toString()), v))) {
				for(let i = 0; i < this._astroObjectList.length; i++) {
					for(let j = 0; j < retList[retList.length-1].subsystem.length; j++) {
						if (retList[retList.length-1].subsystem[j] == this._astroObjectList[i].name) {
							evalList.push(this._astroObjectList[i])
						}
					}
				}
			}
		}
		console.log(retList)*/
		return this._astroObjectList;
	}
}
