import { vec3, ReadonlyVec3 } from "gl-matrix";
import { LODManager } from "./LODManager";
import { BigDecimal, Big } from "bigdecimal.js";
import * as bVec3 from "../utils/big-vec3";

export class AstroObject {
	

	constructor(public position: BigDecimal[],
		    public velocity: BigDecimal[],
		    public acceleration: BigDecimal[], 
		    public name: string,
		    public mass: BigDecimal,
		    public systemSpace: number,
		    public subsystem: string[],
		    public _polarRadius: number,
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
		const DT = Big(dt.toString());
		
		let v0 = bVec3.create();
		bVec3.scale(v0, this.velocity, DT);

		let r0 = bVec3.create();
		bVec3.add(r0, this.position, v0);
		
		let a0 = bVec3.create();
		let aScale = Big("0.5").multiply(DT);
		bVec3.scale(a0, this.acceleration, aScale);
		
		bVec3.add(this.position, r0, a0);
	}

	private _updateVelocity(dt: number) {
		const DT = Big(dt.toString());

		// Intermediate vec3's to copy vec3 operations into
		let i1 = bVec3.create();

		// Copy initial velocity values
		let v0 = bVec3.create();
		bVec3.copy(v0, this.velocity);

		// Set new velocity
		bVec3.scale(i1, this.acceleration, DT);
		bVec3.add(this.velocity, v0, i1);
	}

}
