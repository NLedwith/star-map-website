import { showError, createStaticVertexBuffer, getContext, createStaticIndexBuffer, createProgram} from "./gl-utils"
import { CUBE_INDICES, CUBE_VERTICES, TABLE_VERTICES, TABLE_INDICES, create3dPosColorInterleavedVao, PYRAMID_INDICES, PYRAMID_VERTICES, Sphere } from "./geometry";
import { glMatrix, mat4, quat, ReadonlyVec3, vec3, vec4 } from "gl-matrix";

//.00000000006674
const G = (6.6743*(10**-11));

const vertexShaderSourceCode = `#version 300 es
    precision mediump float;
    
    in vec3 vertexPosition;
    in vec3 vertexColor;

    out vec3 fragmentColor;

    uniform mat4 matWorld;
    uniform mat4 matViewProj;

    void main() {
        fragmentColor = vertexColor;

        gl_Position = matViewProj * matWorld * vec4(vertexPosition, 1.0);
    }`;

const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;
    
    in vec3 fragmentColor;
    out vec4 outputColor;

    void main() {
        outputColor = vec4(fragmentColor, 1.0);
    }`;


class UserController {
    public userPosition: vec3;
    public velocity: vec3;
    public userOrientation: vec3;
    public setUserOrientation: vec3;
    public targetUserOrientation: vec3;
    public rotationVec: vec3;
    public isMoving: boolean;
    public speed: number;
    constructor() {
        this.userPosition = vec3.fromValues(0, 0, 1000)
        this.velocity = vec3.fromValues(0, 0, 0)
        this.userOrientation = vec3.fromValues(0, -90, 0)
        this.setUserOrientation = vec3.fromValues(0, 0, 0)
        this.targetUserOrientation = vec3.fromValues(0, 0, 0)
        this.rotationVec = vec3.fromValues(0, 0, 0)
        this.isMoving = false;
        this.speed = 10
    }

    public translate(dt: number) {
        let movementVec = vec3.fromValues(0,0,0);
        if(this.velocity[2] > 0) {
            //vec3.scale(movementVec, vec3.fromValues((Math.cos(glMatrix.toRadian(user.userOrientation[0]))*Math.cos(glMatrix.toRadian(user.userOrientation[1]))), Math.sin(glMatrix.toRadian(user.userOrientation[0])), (Math.cos(glMatrix.toRadian(user.userOrientation[0]))*Math.sin(glMatrix.toRadian(user.userOrientation[1])))), this.speed)
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(user.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(user.userOrientation[1]))), this.speed)

        } else if(this.velocity[2] < 0) {
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(user.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(user.userOrientation[1]))), -this.speed)

        }
        if(this.velocity[0] > 0) {
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(90+user.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+user.userOrientation[1]))), this.speed)

        } else if(this.velocity[0] < 0) {
            vec3.scale(movementVec, vec3.fromValues(Math.cos(glMatrix.toRadian(90+user.userOrientation[1])), 0, Math.sin(glMatrix.toRadian(90+user.userOrientation[1]))), -this.speed)
        }
        if(this.velocity[1] > 0) {
            vec3.scale(movementVec, vec3.fromValues(0, 1, 0), this.speed)

        } else if(this.velocity[1] < 0) {
            vec3.scale(movementVec, vec3.fromValues(0, 1, 0), -this.speed)
        }

        vec3.add(this.userPosition, this.userPosition, movementVec)//(vec3.scale(this.velocity, this.velocity, dt)))
    }
    public rotate() {
        //this.userOrientation[0] += 1
        //console.log(this.userOrientation[0], this.userOrientation[1])
        let d = Math.sqrt((this.targetUserOrientation[0]-this.setUserOrientation[0])**2 + (this.targetUserOrientation[1]-this.setUserOrientation[1])**2)
        if(d >= 5) {
            let newX = this.setUserOrientation[0] + (10/d)*(this.targetUserOrientation[0]-this.setUserOrientation[0])
            let newY = this.setUserOrientation[1] + (10/d)*(this.targetUserOrientation[1]-this.setUserOrientation[1])
            //console.log(this.userOrientation[0], this.userOrientation[1])
            this.userOrientation[1] -= (newX - this.setUserOrientation[0])/5
            this.userOrientation[0] +=  (newY - this.setUserOrientation[1])/5
    
            this.setUserOrientation[0] = newX
            this.setUserOrientation[1] = newY
        } else {
            this.targetUserOrientation[0] = this.setUserOrientation[0]
            this.targetUserOrientation[1] = this.setUserOrientation[1]
        }
    } 
}

let user = new UserController();

class System {
    public AstroObjects: AstroObject[]
    private minDistance: number
    private maxDistance: number
    constructor(gl: WebGL2RenderingContext, posAttrib: number, colorAttrib: number, divContainerElement: Element, datas: AstroData[]) {
        this.minDistance = 999999
        this.maxDistance = -1
        this.AstroObjects = []

        //
        let ellipsoid = new Sphere(36, 36, 1, 1);

        let ellipsoidVertices = createStaticVertexBuffer(gl, ellipsoid.vertices);
        let ellipsoiIndices = createStaticIndexBuffer(gl, ellipsoid.indices);

        if (!ellipsoidVertices || !ellipsoiIndices) {
            showError(`Failed to create geo: ellipsoid: (v=${!!ellipsoidVertices}, i=${ellipsoiIndices})`)
            return;
        }
        let ellipsoidVao = create3dPosColorInterleavedVao(
            gl, ellipsoidVertices, ellipsoiIndices, posAttrib, colorAttrib);
        if (!ellipsoidVao) {
            showError(`Failed to create VAOs: ellipsoid=${!!ellipsoidVao}`);
            return;
        }
        
        let shape0 = new Shape(vec3.fromValues(0, 1, 0), .05, vec3.fromValues(0, 1, 0), glMatrix.toRadian(1), glMatrix.toRadian(7.25), glMatrix.toRadian(.1), 0, 0, ellipsoidVao, ellipsoid.indices.length)
	let shape1 = new Shape(vec3.fromValues(0, 1, 0), 1.392, vec3.fromValues(0, 1, 0), glMatrix.toRadian(1), glMatrix.toRadian(7.25), glMatrix.toRadian(.1), 0, 0, ellipsoidVao, ellipsoid.indices.length)
        let shape2 = new Shape(vec3.fromValues(1, .75, -1), .00350531609, vec3.fromValues(0, 1, 0), 0, 0,  glMatrix.toRadian(.5), glMatrix.toRadian(1), 1, ellipsoidVao, ellipsoid.indices.length)
        let shape3 = new Shape(vec3.fromValues(1, .25, -1), .00869540229, vec3.fromValues(0, 1, 0), 0, 0,  glMatrix.toRadian(.5), glMatrix.toRadian(1), 1, ellipsoidVao, ellipsoid.indices.length)
        let shape4 = new Shape(vec3.fromValues(1, .25, -1), .0091637931, vec3.fromValues(0, 1, 0), 0, 0,  glMatrix.toRadian(.5), glMatrix.toRadian(1), 1, ellipsoidVao, ellipsoid.indices.length)
        let shape5 = new Shape(vec3.fromValues(1, .25, -1), .0024, vec3.fromValues(0, 1, 0), 0, 0,  glMatrix.toRadian(.5), glMatrix.toRadian(1), 1, ellipsoidVao, ellipsoid.indices.length)
        let shape6 = new Shape(vec3.fromValues(1, .25, -1), .0048, vec3.fromValues(0, 1, 0), 0, 0,  glMatrix.toRadian(.5), glMatrix.toRadian(1), 1, ellipsoidVao, ellipsoid.indices.length)
        
	for(let i = 0; i < datas.length; i++) {
		let mass = 0
		let curShape = shape0
		let name = ""
		switch(i) {
			case 0:
				mass = (1.99*(10**30))
				name = "Sun"
				curShape = shape1
				break
			case 1:
				mass = (3.285*(10**23))
				name = "Mercury"
				curShape = shape2
				break
			case 2:
				mass = (48.685*(10**23))
				name = "Venus"
				curShape = shape3
				break
			case 3: 
				mass = (6*(10**24))
				name = "Earth"
				curShape = shape4
				break
			case 4:
				mass = (6.4191*(10**22))
				name = "Mars"
				curShape = shape6
				break
			case 5:
				mass = (1.898*(10**27))
				name = "Jupiter"
				break
			case 6: 
				mass = (5.683*(10**26))
				name = "Saturn"
				break
			case 7:
				mass = (8.681*(10**25))
				name = "Uranus"
				break
			case 8: 
				mass = (1.0241*(10**26))
				name = "Neptune"
				break
			case 9:
				mass = (1.307*(10**22))
				name = "Pluto"
				break
		}
		if(i != 0){
			this.AstroObjects.push(new AstroObject(curShape, name, mass, 1, 1, vec3.fromValues((datas[i].x*(10**(datas[i].xe+3))), (datas[i].z*(10**(datas[i].ze+3))), -datas[i].y*(10**(datas[i].ye+3))), vec3.fromValues((datas[i].xv*(10**(datas[i].xve+3))), (datas[i].zv*(10**(datas[i].zve+3))), -datas[i].yv*(10**(datas[i].yve+3))), divContainerElement))
		} else {
			this.AstroObjects.push(new AstroObject(curShape, name, mass, 1, 1, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0), divContainerElement))
		}
	}
	/*
	// Need to pull these values from JPL Horizon API and convert
	this.AstroObjects.push(new AstroObject(shape1, "", (1.99*(10**30)), 1, 1, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0), divContainerElement)) // Sun
        this.AstroObjects.push(new AstroObject(shape2, "Mercury", (3.285*(10**23)), 1, 1, vec3.fromValues((-.5146596575*(10**11)), (-.413779996*(10**11)), (.0133902546*(10**11))), vec3.fromValues(20563.71359, -35787.82873, -4810.78023), divContainerElement)) // Mercury
	this.AstroObjects.push(new AstroObject(shape3, "Venus", (48.685*(10**23)), 2, 1, vec3.fromValues((-1.00251152320*(10**11)), (-.39705354015*(10**11)), (.0523900652169227*(10**11))), vec3.fromValues(12657.91636, -32720.35568, -1179.84856), divContainerElement)) // Venus
	this.AstroObjects.push(new AstroObject(shape4, "Earth", (6*(10**24)), 1, 1, vec3.fromValues((-1.4508401140*(10**11)), (-.3651260404*(10**11)), (.0000256939*(10**11))), vec3.fromValues(6798.33795, -29000.20290, 1.66591), divContainerElement)) // Earth
	this.AstroObjects.push(new AstroObject(shape5, "", (7.3*(10**22)), 1, 1, vec3.fromValues((-1.4508602393*(10**11)), (-.3613932604*(10**11)), (.0003691849*(10**11))), vec3.fromValues(5754.86345, -28941.89452, 1.90289), divContainerElement)) // Moon
        this.AstroObjects.push(new AstroObject(shape6, "Mars", (6.4191*(10**23)), 4, 1, vec3.fromValues((-2.1675293037*(10**11)), (1.2253271140*(10**11)), (0.0788317509*(10**11))), vec3.fromValues(-11014.83043, -19023.13965, -128.54525), divContainerElement)) // Mars
i*/    
    }

    public updateSystem(dt: number) {
        // iterate through each astroObject and set acceleration values
        for(let i = 0; i < this.AstroObjects.length; i++) {
            // Set current AstroObject acceleration to 0's so new gravity vec3 can write over it
            this.AstroObjects[i].acceleration = vec3.fromValues(0, 0, 0)
            for(let j = 0; j < this.AstroObjects.length; j++) {
                // Skip current planet thats being evaluated
                if(j != i) {
                    // get directional vec3 between two AstroObjects
                    let xDif = this.AstroObjects[j].position[0] - this.AstroObjects[i].position[0]
                    let yDif = this.AstroObjects[j].position[1] - this.AstroObjects[i].position[1]
                    let zDif = this.AstroObjects[j].position[2] - this.AstroObjects[i].position[2]

                    let directionVec = vec3.fromValues(xDif, yDif, zDif)

                    let gravVec = vec3.create()
                    let distance = Math.sqrt((xDif**2)+(yDif**2)+zDif**2)
                    //
                    let g = (G * this.AstroObjects[j].mass)/(distance**2)
                    vec3.normalize(directionVec, directionVec)
                    vec3.scale(gravVec, directionVec, g)
                    vec3.add(this.AstroObjects[i].acceleration, this.AstroObjects[i].acceleration, gravVec)
                }
            }
            
        }
        for(let i = 0; i < this.AstroObjects.length; i++) {
            this.AstroObjects[i].updatePhysics(dt)
        }
    }
}
function printPlanet(name: string) {
	console.log(name)
}
// Hold info on astro objects along with drawing stuff
class AstroObject {
    public acceleration: vec3;
    public velocity: vec3;
    public div: HTMLDivElement;
    public textNode: Text;
    public txt: Element;

    constructor(public shape: Shape, public name: string, public mass: number, public polarRadius: number, public equatorialRadius: number, public position: vec3, public initialVelocity: vec3, divContainerElement: Element) {
        this.acceleration = [0,0,0]
        this.velocity = this.initialVelocity
        
    	this.div = document.createElement("div")
    	this.div.className = "floating-div"
	this.txt = document.createElement("div")
	this.txt.className = "text-node"
	let dot = document.createElement("div")
	dot.className = "small-point"
    	this.textNode = document.createTextNode(name)
    	this.txt.appendChild(this.textNode)
	this.div.appendChild(dot)
	this.div.appendChild(this.txt)
	let thatName = this.name
	let thatPos = this.position
	this.div.addEventListener('click', function() {console.log(thatName, thatPos})
    	divContainerElement.appendChild(this.div)
    }

    public updatePhysics(dt: number) {
        this.updatePosition(dt)
        this.updateVelocity(dt)
    }

    // Updates AstroObject position based on change of time and acceleration
    private updatePosition(dt: number) {
        // intermediate vec3's to copy vec3 operations into
        let i1 = vec3.create()
        let i2 = vec3.create()

        // Copy initial position and velocity values
        let r0 = vec3.create()
        let v0 = vec3.create()
        vec3.copy(r0, this.position)
        vec3.scale(v0, this.velocity, dt)

        // Set new position
        vec3.add(i1, r0, v0)
        vec3.scale(i2, this.acceleration, (0.5 * (dt**2)))
        vec3.add(this.position, i1, i2)
    }

    private updateVelocity(dt: number) {
        // intermediate vec3's to copy vec3 operations into
        let i1 = vec3.create()

        // Copy initial velocity values
        let v0 = vec3.create()
        vec3.copy(v0, this.velocity)

        // Set new velocity
        vec3.scale(i1, this.acceleration, dt)
        vec3.add(this.velocity, v0, i1)
    }
}

class Shape {
    private matWorld = mat4.create();
    private scaleVec = vec3.create();
    private rotation = quat.create();

    constructor(
        private pos: vec3,
        private scale: number,
        private rotationAxis: vec3,
	private yRotationAngle: number,
        private zRotationAngle: number,
        private rotationSpeed: number,
        private orbitLocation: number,
        private orbitDistance: number,
        public readonly vao: WebGLVertexArrayObject,
        public readonly numIndices: number) {}

    rotate() {
        //this.rotationAxis = vec3.fromValues(0, 0, 1)
        this.yRotationAngle += this.rotationSpeed
        if(this.yRotationAngle >= (2*Math.PI)) {
            this.yRotationAngle = 0
        }
    }
    move() {
        if(this.pos[0] != 0 && this.pos[2] != 0) {
            this.orbitLocation += glMatrix.toRadian(.2);
            if(this.orbitLocation >= (2*Math.PI)) {
                this.orbitLocation = glMatrix.toRadian(.2)
            }
            this.pos[0] = this.orbitDistance * Math.cos(this.orbitLocation);
            this.pos[2] = this.orbitDistance * Math.sin(this.orbitLocation);
        }
    }

    // change this to take in x, y, z positions
    draw(gl: WebGL2RenderingContext, matWorldUniform: WebGLUniformLocation, newPos: vec3, div: HTMLDivElement, textNode: Text, pName: string, mvp: mat4) {
        this.rotate();
        this.pos = newPos
        //this.move();
        let iQuat = quat.create();
        let yQuat = quat.create();
        let zQuat = quat.create();
        const newAngle =glMatrix.toRadian(20)
        quat.setAxisAngle(yQuat, vec3.fromValues(0, 1, 0), this.yRotationAngle);
        quat.setAxisAngle(zQuat, vec3.fromValues(0, 0, 1), this.zRotationAngle);
        quat.multiply(this.rotation, zQuat, yQuat)

        vec3.set(this.scaleVec, this.scale, this.scale, this.scale);
        let drawPos = vec3.fromValues(0,0,0);
        vec3.scale(drawPos, this.pos, 10**-9);
        mat4.fromRotationTranslationScale(
            this.matWorld,
            this.rotation,
            drawPos,
            this.scaleVec);
        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld);
	
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
	
	
	let clipspace = vec4.fromValues(0,0,0,0)
	vec4.transformMat4(clipspace, [drawPos[0], drawPos[1], drawPos[2], 1], mvp)
	
	
	clipspace[0] /= clipspace[2]
	clipspace[1] /= clipspace[2]
	var pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width
	var pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height
	if(clipspace[2] >= 0) {
		div.style.left = Math.floor(pixelX) + "px"
		div.style.top = Math.floor(pixelY) + "px"
	}	
	//console.log(div.style.left, div.style.top)
    }
}
function scrollFunc() {
}
let moveForward = false
let moveBackward = false
let moveRight = false
let moveLeft = false
let moveUp = false
let moveDown = false
function keyDown(e: KeyboardEvent){
    if(user.isMoving == false) {
        user.isMoving = true
    }
    if(e.code == "KeyW") {
        user.velocity[2] = user.speed
    }
    if(e.code == "KeyS") {
        user.velocity[2] = -user.speed
    }
    if(e.code == "KeyD") {
        user.velocity[0] = user.speed
    }
    if(e.code == "KeyA") {
        user.velocity[0] = -user.speed
    }
    if(e.code == "Space") {
        user.velocity[1] = user.speed
    }
    if(e.code == "ControlLeft") {
        user.velocity[1] = -user.speed
    }
    if(e.code == "KeyB") {
    	if(user.speed >= 0.1) {
		user.speed -= 0.1
	} else {
		user.speed -= 0.001
	}
    }
}
function keyUp(e: KeyboardEvent){
    if(e.code == "KeyW") {
        user.velocity[2] = 0
    }
    if(e.code == "KeyS") {
        user.velocity[2] = 0
    }
    if(e.code == "KeyD") {
        user.velocity[0] = 0
    }
    if(e.code == "KeyA") {
        user.velocity[0] = 0
    }
    if(e.code == "Space") {
        user.velocity[1] = 0
    }
    if(e.code == "ControlLeft") {
        user.velocity[1] = 0
    } 
}
let rotating = false
function click(e: MouseEvent){
    if(e.button == 1) {
        if(rotating == false) {
            user.setUserOrientation[0] = e.offsetX
            user.setUserOrientation[1] = e.offsetY
            user.targetUserOrientation[0] = user.setUserOrientation[0]
            user.targetUserOrientation[1] = user.setUserOrientation[1]
            rotating = true
        }
    }
}
function click2(e: MouseEvent){
    if(e.button == 1) {
        user.targetUserOrientation[0] = user.setUserOrientation[0]
        user.targetUserOrientation[1] = user.setUserOrientation[1]
        user.rotationVec[0] = 0
        user.rotationVec[1] = 0
        rotating = false
    }
}
function rotateCamera(e: MouseEvent){
    if(rotating == true) {
        user.targetUserOrientation[0] = e.offsetX
        user.targetUserOrientation[1] = e.offsetY
        //console.log(user.setUserOrientation[0] - user.targetUserOrientation[0],  user.setUserOrientation[1] - user.targetUserOrientation[1])
        user.rotationVec[0] = e.movementX
        user.rotationVec[1] = e.movementY
    }
}
function whee(e: WheelEvent) {
    if(e.deltaY <= -100) {
        moveBackward = false
        moveForward = true
    }
    if(e.deltaY >= 100) {
        moveForward = false
        moveBackward = true
    }
}
function introTo3DDemo(datas: AstroData[]) {
    
    const canvas = document.getElementById('demo-canvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        showError('Could not get Canvas reference');
        return;
    }
    
    var divContainerElement = document.querySelector("#divcontainer")!


    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousedown", click);
    window.addEventListener("mouseup", click2);
    window.addEventListener("mousemove", rotateCamera);
    window.addEventListener("wheel", whee, { passive: false });
   
 
    const gl = getContext(canvas);
   

    const demoProgram = createProgram(gl, vertexShaderSourceCode, fragmentShaderSourceCode);
    if (!demoProgram) {
        showError('Failed to compile WebGL program');
        return;
    }

    const posAttrib = gl.getAttribLocation(demoProgram, 'vertexPosition');
    const colorAttrib = gl.getAttribLocation(demoProgram, 'vertexColor');

    const matWorldUniform = gl.getUniformLocation(demoProgram, 'matWorld');
    const matViewProjUniform = gl.getUniformLocation(demoProgram, 'matViewProj');

    if (posAttrib < 0 || colorAttrib < 0 || !matWorldUniform || !matViewProjUniform) {
        showError(`Failed to get attribs/uniforms: `+
            `pos=${posAttrib}, color=${colorAttrib} `+
            `matWorld=${!!matWorldUniform} matViewProj=${!!matViewProjUniform}`);
        return;
    }
  
    let system = new System(gl, posAttrib, colorAttrib, divContainerElement, datas);

    const matWorld = mat4.create();
    const matView = mat4.create();
    const matProj = mat4.create();

    let lastFrameTime = performance.now();
    const frame = function () {
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        // Update system here
        lastFrameTime = thisFrameTime;

        user.translate(dt)
        user.rotate()

        const cameraX = user.userPosition[0];
        const cameraY = user.userPosition[1];
        const cameraZ = user.userPosition[2];

	// Updating system where every second updates a day
        system.updateSystem(dt)//*86000)
        
        mat4.lookAt(
            matView,
            vec3.fromValues(cameraX, cameraY, cameraZ),
            vec3.fromValues(cameraX+(Math.cos(glMatrix.toRadian(user.userOrientation[0]))*Math.cos(glMatrix.toRadian(user.userOrientation[1]))), cameraY+Math.sin(glMatrix.toRadian(user.userOrientation[0])), cameraZ+(Math.cos(glMatrix.toRadian(user.userOrientation[0]))*Math.sin(glMatrix.toRadian(user.userOrientation[1])))),
            vec3.fromValues(0, 1, 0));

        mat4.perspective(
            matProj,
            glMatrix.toRadian(50),
            canvas.width / canvas.height,
            0.001, 100.0);
            
        const matViewProj = mat4.create();

        mat4.multiply(matViewProj, matProj, matView);

        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;

        gl.clearColor(0.02, 0.02, 0.02, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(demoProgram);


    

       

        gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj);
     
	
	// Here I need to check distance from camera for each item and choose to draw HTML element or 3d model
        system.AstroObjects.forEach((obj) => obj.shape.draw(gl, matWorldUniform, obj.position, obj.div, obj.textNode, obj.name, matViewProj))
      
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

interface AstroData {
	x: number;
	xe: number;
	y: number;
	ye: number;
	z: number;
	ze: number;
	xv: number;
	xve: number;
	yv: number;
	yve: number;
	zv: number;
	zve: number;
}

async function getPlanetData(): Promise<AstroData[]> {
	let ids: string[] = ["10", "199", "299", "399", "499", "599", "699", "799", "899", "999"]	
	let datas: AstroData[] = []
	const date = new Date(Date.now())
	let year = String(date.getFullYear())
	let month = String(date.getMonth())
	if(month.length != 2) {
		month = "0"+month
	}
	let day = String(date.getDate())
	if(day.length != 2) {
		day = "0"+day
	}
	let hour = String(date.getHours())
	if(hour.length != 2) {
		hour = "0"+hour
	}
	let minutes = String(date.getMinutes())
	if(minutes.length != 2) {
		minutes = "0"+minutes
	}
	let time = year+"-"+month+"-"+day+"-"+hour+":"+minutes
	for(let value of ids) {
		let response = await fetch("http://localhost:8000/planet-state?id="+value+"&timestamp="+time, {method: 'GET'})
		if(!response.ok) {
			throw new Error("HTTP error! status: ${response.status}")
		}
		let data: AstroData = await response.json()
		datas.push(data)
	}
	return datas
}
try {
	getPlanetData().then(datas => introTo3DDemo(datas))
} catch(e) {
    showError(`Unhandled JavaScript exception: ${e}`)
}
