import { vec3, ReadonlyVec3 } from "gl-matrix";
import { LODManager } from "./LODManager";
import { BigDecimal, Big, MC } from "bigdecimal.js";
import * as bVec3 from "../utils/big-vec3";
import type { BigVec3 } from "../utils/big-vec3";

/**
 * Represents the generic type for astronomical bodies such as stars, planets, and moons.
 * Holds generic information for astronomical bodies and handles kinematic updates. 
 */
export abstract class AstroBody {

	public readonly name: string;
	public readonly designations: string[];
	public readonly classification: string;
	public readonly mass: BigDecimal;
	private _temperature: number | null;

	private _position: BigVec3;
	private _velocity: BigVec3;
	private _acceleration: BigVec3;
	private _drawPosition: vec3;	

	private _polarRadius: number;
	private _equatorialRadius: number
	private _lodManager: LODManager
	constructor(
		name: string, 
		designations: string[], 
		classification: string, 
		mass: BigDecimal,
		temperature: number | null,
		position: BigVec3,
		velocity: BigVec3,
		acceleration: BigVec3,
		polarRadius: number,
		equatorialRadius: number,
		lodManager: LODManager, public subsystem: string[]) {
			this.name = name;
			this.designations = designations;
			this.classification = classification;
			this.mass = mass;
			this._temperature = temperature;
			this._position = position;
			this._velocity = velocity;
			this._acceleration = acceleration;
			this._drawPosition = AstroBody._setDrawPosition(this._position, -9);
			this._polarRadius = polarRadius;
			this._equatorialRadius = equatorialRadius;
			this._lodManager = lodManager;
	}

	public  updatePhysics(dt: number): void {
		this._updatePosition(dt);
		this._updateVelocity(dt);
		this._drawPosition = AstroBody._setDrawPosition(this._position, -9);
	}	

	/**
	 *  Updates an AstroBody's position using it's current velocity and acceleration.
	 *  @param dt - The change of time since the last update.
	 */
	private _updatePosition(dt: number): void {
		const DT = Big(dt.toString());
		
		let v0 = bVec3.create();
		bVec3.scale(v0, this._velocity, DT);

		let r0 = bVec3.create();
		bVec3.add(r0, this._position, v0);
		
		let a0 = bVec3.create();
		let aScale = Big("0.5").multiply(DT);
		bVec3.scale(a0, this._acceleration, aScale);
		
		bVec3.add(this._position, r0, a0);
	}

	/**
	 *  Updates an AstroBody's velocity using it's current acceleration.
	 *  @param dt - The change of time since the last update.
	 */
	private _updateVelocity(dt: number): void {
		const DT = Big(dt.toString());

		// Intermediate vec3's to copy vec3 operations into
		let i1 = bVec3.create();

		// Copy initial velocity values
		let v0 = bVec3.create();
		bVec3.copy(v0, this._velocity);

		// Set new velocity
		bVec3.scale(i1, this._acceleration, DT);
		bVec3.add(this._velocity, v0, i1);
	}

	private static _setDrawPosition(position: BigVec3, scalar: number): vec3 {
		let bVecA = bVec3.create();
		bVec3.scale(bVecA, position, Big("10").pow(scalar, new MC(20)));
		return vec3.fromValues(Number(bVecA[0].toEngineeringString()), Number(bVecA[1].toEngineeringString()), Number(bVecA[2].toEngineeringString()));
	}

	public getDrawPosition(): vec3 {
		return this._drawPosition;
	}

	public getPosition(): BigVec3 {
		return this._position;
	}

	public getVelocity(): BigVec3 {
		return this._velocity;
	}

	public getAcceleration(): BigVec3 {
		return this._acceleration;
	}

	public getLODManager(): LODManager {
		return this._lodManager;
	}
}

export class PlanetaryBody extends AstroBody {
	
	constructor(
		name: string, 
		designations: string[], 
		classification: string, 
		mass: BigDecimal,
		temperature: number | null,
		position: BigVec3,
		velocity: BigVec3,
		acceleration: BigVec3,
		polarRadius: number,
		equatorialRadius: number,
		lodManager: LODManager, subsystem: string[]) {
			super(name, designations, classification, mass, temperature, position, velocity, acceleration, polarRadius, equatorialRadius, lodManager, subsystem);
	}
}

export class StellarBody extends AstroBody {
	
	private _rightAscension: [number, number, number];
	private _declination: [number, number, number];
	private _parallax: [number, number];
	private _apparentMagnitude: number | null;
	private _absoluteMagnitude: number | null;
	private _luminosity: number | null;

	constructor(
		name: string, 
		designations: string[], 
		classification: string, 
		mass: BigDecimal, 
		temperature: number | null,
		velocity: BigVec3, 
		acceleration: BigVec3, 
		radius: number, 
		lodManager: LODManager,
		rightAscension: [number, number, number], 
		declination: [number, number, number], 
		parallax: [number, number], 
		apparentMagnitude: number | null, 
		absoluteMagnitude: number | null, 
		luminosity: number | null, subsystem: string[]) {
			super(name, designations, classification, mass, temperature, StellarBody._getPositionFromStellarCoords(rightAscension, declination, parallax), velocity, acceleration, radius, radius, lodManager, subsystem);
			this._rightAscension = rightAscension;
			this._declination = declination;
			this._parallax = parallax;
			this._apparentMagnitude = apparentMagnitude;
			this._absoluteMagnitude = absoluteMagnitude;
			this._luminosity = luminosity;
	}

	private static _getPositionFromStellarCoords(rightAscension: [number, number, number], declination: [number, number, number], parallax: [number, number]): BigVec3 {
		
		const alpha = (rightAscension[0] + (rightAscension[1] / 60) + (rightAscension[2] / 3600)) * 15 * (Math.PI / 180);
		const delta = (declination[0] + (declination[1] / 60) + (declination[2] / 3600)) * (Math.PI / 180);
		 
		
		const parsecsDistance = 1000 / (parallax[0] + Math.random() * (parallax[1] - (-1 * parallax[1])) + (-1 * parallax[1]));
		const metersDistance = Big(parsecsDistance.toString()).multiply(Big("3.086").multiply(Big("10").pow(16)));

		const x0 = metersDistance.multiply(Big(Math.cos(delta).toString()).multiply(Big(Math.cos(alpha).toString()))).toString();
		const y0 = metersDistance.multiply(Big(Math.cos(delta).toString()).multiply(Big(Math.sin(alpha).toString()))).toString();
		const z0 = metersDistance.multiply(Big(Math.sin(delta).toString())).toString();

		return bVec3.fromValues(x0, z0, y0);
	}	
}



