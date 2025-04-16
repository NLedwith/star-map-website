


// Gravitational constant in m^3*kg^-1*s^-2
const G = (6.6743 * (10**-11));

// This handles physics for an entire Astronomical system
// Examples would be The Solar System and Alpha Centauri.
export class AstroSystem {

	constructor(private _astroObjectList: AstroObject[]) { }

	// Calculates new acceleration values due to gravity and computes new positions of each astro object in the system
	public updateAstroSystem(dt: number) {
		this._computeGravityVectors();
		for (const astroObject of this._astroObjectList) {
			astroObject.updatePhysics(dt);	
		}
	}

	private _computeGravityVectors() {
		
		// Zero out every AstroObject's acceleration
		for (const astroObject of this.AstroObjectList) {
			vec3.zero(astroObject.acceleration);
		}

		// Recalculate the acceleration due to gravity for every AstroObject in the system
		// The invariant is that the gravity is completely calculated for every AstroObject to the left of i
		for (let i = 0; i < (this.AstroObjectList.length - 1); i++) {
			for (let j = (i + 1); j < this.AstroObjectList.length; j++) {
				let gravityAccelI = vec3.create();
				let gravityAccelJ = vec3.create();
					
				// Find directional vectors for the force of gravity between the 2 AstroObjects
				vec3.subtract(gravityAccelI, this.AstroObjectList[j].position, this.AstroObjectList[i].position);
				vec3.inverse(gravityAccelJ, gravityAccelI);

				// Normalize the directional vectors
				vec3.normalize(gravityAccelI, gravityAccelI);
				vec3.normalize(gravityAccelJ, gracityAccelJ);

				const sqDistance = vec3.squaredDistance(this.AstroObjectList[i].position, this.AstroObjectList[j].position);

				// Calculate the magnitude of the force of gravity for both objects				
				const gMagI = (G * this.AstroObject[j].mass) / sqDistance;
				const gMagJ = (G * this.AstroObject[i].mass) / sqDistance;
				
				
				vec3.scale(gravityAccelI, gravityAccelI, gMagI);
				vec3.scale(gravityAccelJ, gravityAccelJ, gMagJ);

				// Compound acceleration due to gravity for both objects to get their overall acceleration
				vec3.add(this.AstroObjectList[i].acceleration, this.AstroObjectList[i].acceleration, gMagI);
				vec3.add(this.AstroObjectList[j].acceleration, this.AstroObjectList[j].acceleration, gMagJ);
			}
		}
	}
}
