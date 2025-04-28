import { glMatrix, mat4, quat, ReadonlyVec3, vec3, vec4 } from "gl-matrix";
import { AstroObject } from "../models/AstroObject";

export class UserController {
    public userPosition: vec3;
    public velocity: vec3;
    public userOrientation: vec3;
    public setUserOrientation: vec3;
    public targetUserOrientation: vec3;
    public rotationVec: vec3;
    public isMoving: boolean;
    public speed: number;
    public viewVec: vec3;
    public coupledAstroObject: AstroObject | null;
    
    constructor() {
        this.userPosition = vec3.fromValues(0, 10000, 10000)
        this.velocity = vec3.fromValues(0, 0, 0)
        this.userOrientation = vec3.fromValues(-45, -90, 0)
	this.viewVec = vec3.fromValues(0, 0, -1)
        this.setUserOrientation = vec3.fromValues(0, 0, 0)
        this.targetUserOrientation = vec3.fromValues(0, 0, 0)
        this.rotationVec = vec3.fromValues(0, 0, 0)
        this.isMoving = false;
        this.speed = 10000
	this.coupledAstroObject = null;
    }

    public translate(dt: number) {
        let movementVec = vec3.fromValues(0,0,0);
	let curSpeed = this._getCurSpeed() * dt
	//console.log(curSpeed);
        if(this.velocity[2] > 0) {
            if (this.coupledAstroObject != null) {
		let iVec = vec3.create();
		let tVec = vec3.create();
		vec3.scale(tVec, this.coupledAstroObject.position, 10**-9)
		vec3.subtract(iVec, tVec, this.userPosition);
		vec3.normalize(iVec, iVec);
		console.log(iVec)
		vec3.scale(movementVec, iVec, curSpeed);
	    } else { 
            	vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(this.userOrientation[1]))), curSpeed)
	    }

        } else if(this.velocity[2] < 0) {
		if (this.coupledAstroObject != null) {
			let iVec = vec3.create();
			let tVec = vec3.create();
			vec3.scale(tVec, this.coupledAstroObject.position, 10**-9)
			vec3.subtract(iVec, tVec, this.userPosition);
			vec3.normalize(iVec, iVec);
			console.log(iVec)
			vec3.scale(movementVec, iVec, -curSpeed);
		} else {
            		vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(this.userOrientation[1]))), -curSpeed)
		}

        }
        if(this.velocity[0] > 0) {
		if (this.coupledAstroObject != null) {
			let iVec = vec3.create();
			let tVec = vec3.create();
			let qVec = vec3.create();
			let cVec = vec3.fromValues(0, 1, 0);
			vec3.scale(tVec, this.coupledAstroObject.position, 10**-9)
			vec3.subtract(iVec, tVec, this.userPosition);
			vec3.cross(qVec, cVec, iVec)
			vec3.normalize(qVec, qVec);
			console.log(qVec)
			vec3.scale(movementVec, qVec, -curSpeed);
		} else {
			vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(90+this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+this.userOrientation[1]))), curSpeed)
		}
        } else if(this.velocity[0] < 0) {
		if (this.coupledAstroObject != null) {
			let iVec = vec3.create();
			let tVec = vec3.create();
			let qVec = vec3.create();
			let cVec = vec3.fromValues(0, 1, 0);
			vec3.scale(tVec, this.coupledAstroObject.position, 10**-9)
			vec3.subtract(iVec, tVec, this.userPosition);
			vec3.cross(qVec, cVec, iVec)
			vec3.normalize(qVec, qVec);
			console.log(qVec)
			vec3.scale(movementVec, qVec, curSpeed);
		} else {
            		vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(90+this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+this.userOrientation[1]))), -curSpeed)
        
		}
	}
        if(this.velocity[1] > 0) {

		if (this.coupledAstroObject != null) {
			let iVec = vec3.create();
			let tVec = vec3.create();
			let qVec = vec3.create();
			let cVec = vec3.fromValues(0, 1, 0);
			vec3.scale(tVec, this.coupledAstroObject.position, 10**-9)
			vec3.subtract(iVec, tVec, this.userPosition);
			vec3.cross(qVec, cVec, iVec)
			vec3.cross(cVec, qVec, iVec)
			vec3.normalize(cVec, cVec)
			console.log(iVec);
			vec3.scale(movementVec, cVec, -curSpeed);

		} else {
            		vec3.scale(movementVec, vec3.fromValues(0, 1, 0), curSpeed)
		}

        } else if(this.velocity[1] < 0) {
		if (this.coupledAstroObject != null) {
			let sightVec = vec3.fromValues(Math.cos(glMatrix.toRadian(this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(this.userOrientation[1])))
			let crossSightVec = vec3.fromValues(Math.cos(glMatrix.toRadian(90+this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+this.userOrientation[1])))
			let crossVec = vec3.create()
			vec3.cross(crossVec, sightVec, crossSightVec)
			vec3.scale(movementVec, crossVec, curSpeed)
		} else {	
            		vec3.scale(movementVec, vec3.fromValues(0, 1, 0), -curSpeed)
		}
	}

        vec3.add(this.userPosition, this.userPosition, movementVec)//(vec3.scale(this.velocity, this.velocity, dt)))
    }
    public rotate(dt: number) {
        //this.userOrientation[0] += 1
       // console.log(this.setUserOrientation[0], this.targetUserOrientation[0])
        if (this.coupledAstroObject == null) {
	let d = Math.sqrt((this.targetUserOrientation[0]-this.setUserOrientation[0])**2 + (this.targetUserOrientation[1]-this.setUserOrientation[1])**2)
        if(d >= 5) {
            let newX = this.setUserOrientation[0] + (10/d)*(this.targetUserOrientation[0]-this.setUserOrientation[0])
            let newY = this.setUserOrientation[1] + (10/d)*(this.targetUserOrientation[1]-this.setUserOrientation[1])
            //console.log(this.userOrientation[0], this.userOrientation[1])
            this.userOrientation[1] -= (newX - this.setUserOrientation[0])/5
            this.userOrientation[0] +=  (newY - this.setUserOrientation[1])/5
    /*
            cameraX+(Math.cos(glMatrix.toRadian(user.userOrientation[0]))*Math.cos(glMatrix.toRadian(user.userOrientation[1]))) 
	    cameraY+Math.sin(glMatrix.toRadian(user.userOrientation[0]))
	    cameraZ+(Math.cos(glMatrix.toRadian(user.userOrientation[0]))*Math.sin(glMatrix.toRadian(user.userOrientation[1])))
*/	    
            //this.viewVec[0] = this.userPosition[0]+(Math.cos(glMatrix.toRadian(this.userOrientation[0]))*Math.cos(glMatrix.toRadian(this.userOrientation[1]))) 
	    //this.viewVec[1] = this.userPosition[1]+Math.sin(glMatrix.toRadian(this.userOrientation[0]))
            //this.viewVec[2] = this.userPosition[2]+(Math.cos(glMatrix.toRadian(this.userOrientation[0]))*Math.sin(glMatrix.toRadian(this.userOrientation[1])))
	    this.setUserOrientation[0] = newX
            this.setUserOrientation[1] = newY
        } else {
            this.targetUserOrientation[0] = this.setUserOrientation[0]
            this.targetUserOrientation[1] = this.setUserOrientation[1]
        }
	this.viewVec[0] = this.userPosition[0]+(Math.cos(glMatrix.toRadian(this.userOrientation[0]))*Math.cos(glMatrix.toRadian(this.userOrientation[1]))) 
	this.viewVec[1] = this.userPosition[1]+Math.sin(glMatrix.toRadian(this.userOrientation[0]))
        this.viewVec[2] = this.userPosition[2]+(Math.cos(glMatrix.toRadian(this.userOrientation[0]))*Math.sin(glMatrix.toRadian(this.userOrientation[1])))
	} else {
		let i1 = vec3.create()
		vec3.scale(i1, this.coupledAstroObject.position, 10**-9);
		vec3.subtract(this.viewVec, i1, this.userPosition);
		vec3.add(this.viewVec, this.viewVec, this.userPosition);
		let tVec = vec3.create()
		vec3.normalize(tVec, this.viewVec);
		let theta = Math.asin(tVec[0])
		let phi = Math.asin((tVec[1])/Math.cos(theta))
		this.userOrientation[0] = (theta*180)/Math.PI
		this.userOrientation[1] = (phi*180)/Math.PI
		console.log(this.userOrientation);
		//console.log(this.viewVec[0], this.viewVec[1], this.viewVec[2])
		//console.log(theta, phi)
	}
    }


    public setCoupledAstroObject(obj: AstroObject) {
    	this.coupledAstroObject = obj;
	//console.log(`Coupled object set to ${obj.name}`);
    }

    private _getCurSpeed(): number {
    	let curSpeed = this.speed;
	if (this.coupledAstroObject != null) {
		let scaledObjPos = vec3.create();
		vec3.scale(scaledObjPos, this.coupledAstroObject.position, 10**-9)
		let dist = vec3.distance(this.userPosition, scaledObjPos)
		let posSpeed = .1;
		console.log(dist);
		if (dist > 5) {
			curSpeed = dist;
		} else {

			curSpeed = this.speed
		}
	}
	return curSpeed;
    }
}
