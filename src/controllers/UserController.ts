import { glMatrix, mat4, quat, ReadonlyVec3, vec3, vec4 } from "gl-matrix";

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
    
    constructor() {
        this.userPosition = vec3.fromValues(0, 10000, 10000)
        this.velocity = vec3.fromValues(0, 0, 0)
        this.userOrientation = vec3.fromValues(-45, -90, 0)
	this.viewVec = vec3.fromValues(0, 0, -1)
        this.setUserOrientation = vec3.fromValues(0, 0, 0)
        this.targetUserOrientation = vec3.fromValues(0, 0, 0)
        this.rotationVec = vec3.fromValues(0, 0, 0)
        this.isMoving = false;
        this.speed = 1000
    }

    public translate(dt: number) {
        let movementVec = vec3.fromValues(0,0,0);
	let curSpeed = this.speed * dt
        if(this.velocity[2] > 0) {
            
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(this.userOrientation[1]))), curSpeed)

        } else if(this.velocity[2] < 0) {
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(this.userOrientation[1]))), -curSpeed)

        }
        if(this.velocity[0] > 0) {
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(90+this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+this.userOrientation[1]))), curSpeed)

        } else if(this.velocity[0] < 0) {
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(90+this.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+this.userOrientation[1]))), -curSpeed)
        }
        if(this.velocity[1] > 0) {
            vec3.scale(movementVec, vec3.fromValues(0, 1, 0), curSpeed)

        } else if(this.velocity[1] < 0) {
            vec3.scale(movementVec, vec3.fromValues(0, 1, 0), -curSpeed)
        }

        vec3.add(this.userPosition, this.userPosition, movementVec)//(vec3.scale(this.velocity, this.velocity, dt)))
    }
    public rotate(dt: number) {
        //this.userOrientation[0] += 1
       // console.log(this.setUserOrientation[0], this.targetUserOrientation[0])
        
	let d = Math.sqrt((this.targetUserOrientation[0]-this.setUserOrientation[0])**2 + (this.targetUserOrientation[1]-this.setUserOrientation[1])**2)
        if(d >= 5) {
            let newX = this.setUserOrientation[0] + (dt*this.speed*(30/d))*(this.targetUserOrientation[0]-this.setUserOrientation[0])
            let newY = this.setUserOrientation[1] + (dt*this.speed*(30/d))*(this.targetUserOrientation[1]-this.setUserOrientation[1])
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
    } 
}
