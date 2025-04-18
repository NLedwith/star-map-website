import { showError, createStaticVertexBuffer, getContext, createStaticIndexBuffer, createProgram} from "./utils/gl-utils"
import { CUBE_INDICES, CUBE_VERTICES, TABLE_VERTICES, TABLE_INDICES, create3dPosColorInterleavedVao, PYRAMID_INDICES, PYRAMID_VERTICES, Sphere } from "./geometry";
import { glMatrix, mat4, quat, ReadonlyVec3, vec3, vec4 } from "gl-matrix";
import { UserController } from "./controllers/UserController";
import { ApiClient } from "./services/ApiClient";
import planetData from "./config/astroobjectdata.json";
import { AstroObjectConfig } from "./interfaces/AstroObjectConfig";
import { LODManager } from "./models/LODManager";
import { WebGLShape } from "./models/WebGLShape";
import { AstroObject } from "./models/AstroObject";
import { AstroSystem } from "./models/AstroSystem";

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

let user = new UserController();

class System {
    public AstroObjects: AstroObject[]
    private minDistance: number
    private maxDistance: number
    constructor(gl: WebGL2RenderingContext, posAttrib: number, colorAttrib: number, divContainerElement: Element, user: UserController) {
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
	/*        
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
		this.AstroObjects.push(new AstroObject(curShape, name, mass, 1, 1, vec3.fromValues((datas[i].x*(10**(datas[i].xe+3))), (datas[i].z*(10**(datas[i].ze+3))), -datas[i].y*(10**(datas[i].ye+3))), vec3.fromValues((datas[i].xv*(10**(datas[i].xve+3))), (datas[i].zv*(10**(datas[i].zve+3))), -datas[i].yv*(10**(datas[i].yve+3))), divContainerElement, user))
		} else {
			this.AstroObjects.push(new AstroObject(curShape, name, mass, 1, 1, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0), divContainerElement, user))
		}
	}*/
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
/*
class AstroObject {
    public acceleration: vec3;
    public velocity: vec3;
    public div: HTMLDivElement;
    public textNode: Text;
    public txt: Element;

    constructor(public shape: Shape, public name: string, public mass: number, public polarRadius: number, public equatorialRadius: number, public position: vec3, public initialVelocity: vec3, divContainerElement: Element, user: UserController) {
        this.acceleration = [0,0,0]
        this.velocity = this.initialVelocity
    
        //this.userOrientation[0] += 1
       // console.log(this.setUserOrientation[0], this.targetUserOrientation[0])
    	this.div = document.createElement("div")
	if(this.name == "Sun")
		this.div.className = "sun"
	else {
		this.div.className = "planet"
	}
	this.txt = document.createElement("div")
	this.txt.className = "text-node"
	let dot = document.createElement("div")
	//dot.className = "small-point"
    	this.textNode = document.createTextNode(name)
    	this.txt.appendChild(this.textNode)
	//this.div.appendChild(dot)
	this.div.appendChild(this.txt)
	let thatName = this.name
	let thatPos = this.position
	let thatUsr = user
	this.div.addEventListener('dblclick', function() {
		//console.log(thatUsr.userOrientation[0], thatUsr.userOrientation[1])
		//thatUsr.setUserOrientation[0] = 0 
		//thatUsr.setUserOrientation[1] = thatUsr.userOrientation[1]6
		//thatUsr.targetUserOrientation[0] = (thatPos[1]-thatUsr.userPosition[1]) * (10**-9)
		//let theta = Math.asin(i
		let a = vec3.create()
		vec3.subtract(a, thatPos, thatUsr.userPosition) // hypotenuse
		vec3.normalize(a, a)
		console.log("a: ", a)
		let q = vec3.create()
		let b = vec3.create()
		b[0] = -thatUsr.userPosition[0]
		b[1] = -thatUsr.userPosition[1]
		b[2] = -thatUsr.userPosition[2]
		vec3.add(q, b, thatUsr.viewVec)
		console.log("q: ", q)
		vec3.normalize(q, q)
		console.log("normal q:", q)
		console.log("b: ", b)
		let c = vec3.create()
		vec3.subtract(c, a, b)
		console.log("c: ", c)
		//console.log("t:", t)
	      	let targetVec = vec3.create()
		//vec3.normalize(targetVec, t)
		//console.log(thatUsr.viewVec)
		thatUsr.viewVec[0] += targetVec[0]
		thatUsr.viewVec[1] += targetVec[1]
		thatUsr.viewVec[2] += targetVec[2] + 1
	})
		
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
}*/

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
	
	

	
	//THIS NEEDS TO BE ADDED IN THE LODMANAGER
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
async function main() {
    
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
    let astroObjectList = await buildAstroObjects(gl, posAttrib, colorAttrib);
    let system = new AstroSystem(astroObjectList);

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
        user.rotate(dt)

        const cameraX = user.userPosition[0];
        const cameraY = user.userPosition[1];
        const cameraZ = user.userPosition[2];

	// Updating system where every second updates a day
        system.updateAstroSystem(dt*86000)
        
        mat4.lookAt(
            matView,
            vec3.fromValues(cameraX, cameraY, cameraZ),
            vec3.fromValues(user.viewVec[0], user.viewVec[1], user.viewVec[2]),
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

        gl.clearColor(0.0039, 0.0429, 0.0976, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(demoProgram);


    

       

        gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj);
     
	
	// Here I need to check distance from camera for each item and choose to draw HTML element or 3d model
        system._astroObjectList.forEach((obj) => obj._lodManager.draw(dt, vec3.distance(user.userPosition, obj.position), gl, matWorldUniform, obj.position,  matViewProj))
      
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

async function buildAstroObjects(gl: WebGL2RenderingContext, posAttrib: number, colorAttrib: number): Promise<AstroObject[]>{
	let ret: AstroObject[] = []
	const api = new ApiClient();

	const curEphemeris = await api.getEphemeris(new Date(Date.now()), Object.keys(planetData));

	let ellipsoid = new Sphere(36, 36, 1, 1);

        let ellipsoidVertices = createStaticVertexBuffer(gl, ellipsoid.vertices);
        let ellipsoidIndices = createStaticIndexBuffer(gl, ellipsoid.indices);

        if (!ellipsoidVertices || !ellipsoidIndices) {
            showError(`Failed to create geo: ellipsoid: (v=${!!ellipsoidVertices}, i=${ellipsoidIndices})`)
	    return ret;
        }
        let ellipsoidVao = create3dPosColorInterleavedVao(
            gl, ellipsoidVertices, ellipsoidIndices, posAttrib, colorAttrib);
        if (!ellipsoidVao) {
            showError(`Failed to create VAOs: ellipsoid=${!!ellipsoidVao}`);
        	return ret;
	}

	
    	var divContainerElement = document.querySelector("#divcontainer")!

	const initialData = planetData as Record<string, AstroObjectConfig>;
	Object.entries(initialData).forEach(([key, data]) => {
		// Get WebGLShape
		let shape = new WebGLShape(vec3.create(), 
					  1,
					vec3.fromValues(0,1,0),
					  glMatrix.toRadian(4),
					  glMatrix.toRadian(20),
					  glMatrix.toRadian(1),
					  ellipsoidVao,
					  ellipsoid.indices.length);
		let lodManager = new LODManager(shape, divContainerElement, data.name);
		let position = vec3.fromValues((curEphemeris[key].xPos * (10**curEphemeris[key].xPosExpn)), (curEphemeris[key].zPos * (10**curEphemeris[key].zPosExpn)), -(curEphemeris[key].yPos * (10**curEphemeris[key].yPosExpn)));
		vec3.scale(position, position, 1000);

		let velocity = vec3.fromValues((curEphemeris[key].xVel * (10**curEphemeris[key].xVelExpn)), (curEphemeris[key].zVel * (10**curEphemeris[key].zVelExpn)), -(curEphemeris[key].yVel * (10**curEphemeris[key].yVelExpn)));

		vec3.scale(velocity, velocity, 1000);
		let acceleration = vec3.create();

		let name = data.name;
		let mass = eval(data.mass);
		let pRadius = 1;
		let eRadius = 1;
		let astroObject = new AstroObject(position,
						 velocity,
						 acceleration,
						 name,
						 mass,
						 pRadius,
						 eRadius,
						 lodManager);



		let newObj = new AstroObject(position, velocity, acceleration, name, mass, pRadius, eRadius, lodManager);
		console.log(`Key: ${key}, Name: ${data.name}, Mass: ${data.mass}`);
		console.log(`Position: ${curEphemeris[key].xPos}`)	
		ret.push(newObj);
		console.log(ret);
	});
	


	return ret
}

try {
	main()
	// Initialize UserController
	// Initialize AstroObjects
	// Initialize AstroSystem
	//

} catch(e) {
    showError(`Unhandled JavaScript exception: ${e}`)
}
