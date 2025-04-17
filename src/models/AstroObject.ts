import { vec3 } from "gl-matrix";
import { LODManager } from "./LODManager";

export class AstroObject {
	

	constructor(public position: vec3,
		    public velocity: vec3,
		    public acceleration: vec3, 
		    public name: string,
		    public mass: number,
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
		let i1 = vec3.create();
		let i2 = vec3.create();

		// Copy initial position and velocity values
		let r0 = vec3.create();
		let v0 = vec3.create();
		vec3.copy(r0, this.position);
		vec3.scale(v0, this.velocity, dt);
		vec3.add(i1, r0, v0);
		vec3.scale(i2, this.acceleration, (0.5 * (dt**2)));
		vec3.add(this.position, i1, i2);	
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
