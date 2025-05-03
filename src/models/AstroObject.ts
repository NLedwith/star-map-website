import { vec3, ReadonlyVec3 } from "gl-matrix";
import { LODManager } from "./LODManager";

export class AstroObject {
	

	constructor(public position: vec3,
		    public velocity: vec3,
		    public acceleration: vec3, 
		    public name: string,
		    public mass: number,
		    public systemSpace: number,
		    public subsystem: string[],
		    private _polarRadius: number,
		    private _equatorialRadius: number,
		   public _lodManager: LODManager,
		   ) {
	}

	public  updatePhysics(dt: number) {
		this._updatePosition(dt);
		this._updateVelocity(dt);
	}	

	// Updates AstroObject position based on change of time and acceleration
	private _updatePosition(dt: number) {
		// Intermediate vec3's to copy vec3 operations into
		/*let i1 = vec3.create();
		let i2 = vec3.create();

		// Copy initial position and velocity values
		let r0  = vec3.create();
		let v0 = vec3.create();
		vec3.copy(r0, this.position);
		vec3.scale(v0, this.velocity, dt);
		let i1 = vec3.fromValues(r0[0] + v0[0], r0[1] + v0[1], r0[2] + v0[2]);
		vec3.add(i1, r0 as ReadonlyVec3, v0 as ReadonlyVec3);
		vec3.scale(i2, this.acceleration, (0.5 * (dt**2)));
		*/
		
		if (this.name == "Makemake") {	
	      		let i = this.position[0] + this.velocity[0]
			const j: number = Number.MAX_SAFE_INTEGER;
			this.position[0] = i//(this.velocity[0] * dt) + (0.5 * this.acceleration[0] * (dt**2));
			this.position[1] = this.position[1] + this.velocity[1]//(this.velocity[1] * dt) + (0.5 * this.acceleration[1] * (dt**2));
			this.position[2] = this.position[2] + this.velocity[2]//(this.velocity[2] * dt) + (0.5 * this.acceleration[2] * (dt**2));
			vec3.set(this.position, i, this.position[1] + this.velocity[1], this.position[2]+this.velocity[2])
			console.log(this.position)
		} else {
	      		let i = this.position[0] + this.velocity[0]
			this.position[0] = i//(this.velocity[0] * dt) + (0.5 * this.acceleration[0] * (dt**2));
			this.position[1] = this.position[1] + this.velocity[1]//(this.velocity[1] * dt) + (0.5 * this.acceleration[1] * (dt**2));
			this.position[2] = this.position[2] + this.velocity[2]//(this.velocity[2] * dt) + (0.5 * this.acceleration[2] * (dt**2));
		}
	}

	private _updateVelocity(dt: number) {
		// Intermediate vec3's to copy vec3 operations into
		let i1 = vec3.create();

		// Copy initial velocity values
		let v0 = vec3.create();
		vec3.copy(v0, this.velocity);

		// Set new velocity
		vec3.scale(i1, this.acceleration, dt);
		vec3.add(this.velocity, v0, i1);
	}

}
