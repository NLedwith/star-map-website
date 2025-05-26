import { showError, createStaticVertexBuffer, getContext, createStaticIndexBuffer, createProgram} from "./utils/gl-utils"
import { CUBE_INDICES, CUBE_VERTICES, TABLE_VERTICES, TABLE_INDICES, create3dPosColorInterleavedVao, PYRAMID_INDICES, PYRAMID_VERTICES, Sphere } from "./geometry";
import { glMatrix, mat4, quat, ReadonlyVec3, vec3, vec4 } from "gl-matrix";
import { UserController } from "./controllers/UserController";
import { ApiClient } from "./services/ApiClient";
import planetData from "./config/astroobjectdata.json";
import { AstroObjectConfig } from "./interfaces/AstroObjectConfig";
import { StarConfig } from "./interfaces/StarConfig";
import { LODManager } from "./models/LODManager";
import { WebGLShape } from "./models/WebGLShape";
import { AstroObject } from "./models/AstroObject";
import { AstroSystem } from "./models/AstroSystem";
import  * as bVec3  from "./utils/big-vec3";
import { BigDecimal, Big, MathContext, MC } from "bigdecimal.js";
import starData from "./config/nearbystars.json";

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
	
	
//	var loader = document.querySelector("#loader")!;
    	const canvas = document.getElementById('demo-canvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        showError('Could not get Canvas reference');
        return;
    }
   var loader = document.querySelector("#loader")!; 
 
    var divContainerElement = document.querySelector("#divcontainer")!
    var dataContainer = document.getElementById("datacontainer")!
    var dataContainerName = document.getElementById("datacontainerName")!
    var dataContainerPosition = document.getElementById("datacontainerPosition")!
    var dataContainerVelocity = document.getElementById("datacontainerVelocity")!
    var dataContainerAcceleration = document.getElementById("datacontainerAcceleration")!

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
    let astroObjectList = await buildAstroObjects(gl, posAttrib, colorAttrib, user);
    let system = new AstroSystem(astroObjectList);

    const matWorld = mat4.create();
    const matView = mat4.create();
    const matProj = mat4.create();
    
    const loaderText = document.getElementById('loader-text');
    if (loaderText != null) {
	loaderText.style.animationIterationCount = '1';
    	loaderText.addEventListener('animationend', (event) => {
		loader.classList.add("loader-overlay--hidden");
    	});
    } else {
    	loader.classList.add("loader-overlay--hidden");
    }
    //loader.classList.add("loader-overlay--hidden");
   
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
        //system.updateAstroSystem(dt)
        
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
     

	/*
	system._astroObjectList = system._astroObjectList.sort((a, b) => {
		let bIVecA = bVec3.create();
		let bIVecB = bVec3.create();
		bVec3.scale(bIVecA, a.position, Big("10").pow(-9, new MC(20)));
		bVec3.scale(bIVecB, b.position, Big("10").pow(-9, new MC(20)));
		let iVecA = vec3.fromValues(Number(bIVecA[0].toBigInt()), Number(bIVecA[1].toBigInt()), Number(bIVecA[2].toBigInt()));
		let iVecB = vec3.fromValues(Number(bIVecB[0].toBigInt()), Number(bIVecB[1].toBigInt()), Number(bIVecB[2].toBigInt()));
		return vec3.distance(user.userPosition, iVecB)-vec3.distance(user.userPosition, iVecA)
	});*/	

	if(user.coupledAstroObject == null) {
		dataContainer.style.visibility = "hidden";
	} else {
		dataContainer.style.visibility = "visible";
		dataContainerName.innerHTML = user.coupledAstroObject.name;
		dataContainerPosition.innerHTML = `${user.coupledAstroObject.position[0]}, ${user.coupledAstroObject.position[1]}, ${user.coupledAstroObject.position[2]}`;
		dataContainerVelocity.innerHTML = `${user.coupledAstroObject.velocity[0]}, ${user.coupledAstroObject.velocity[1]}, ${user.coupledAstroObject.velocity[2]}`;
		dataContainerAcceleration.innerHTML = `${user.coupledAstroObject.acceleration[0]}, ${user.coupledAstroObject.acceleration[1]}, ${user.coupledAstroObject.acceleration[2]}`;
	}

	// Here I need to check distance from camera for each item and choose to draw HTML element or 3d model
        let i = 0
	let retList = system.getDrawList(user.userPosition)
	let v1 = bVec3.create();
	let v2 = bVec3.create();
	system._astroObjectList.forEach((obj) => {
		obj._lodManager.draw(dt, retList.includes(obj), gl, matWorldUniform, obj.drawPos, matViewProj, i, vec3.distance(user.userPosition, obj.drawPos));
		i++;
	});
      
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

async function buildAstroObjects(gl: WebGL2RenderingContext, posAttrib: number, colorAttrib: number, user: UserController): Promise<AstroObject[]>{
	let ret: AstroObject[] = []
	const api = new ApiClient();

	const curEphemeris = await api.getEphemeris(new Date(Date.now()), Object.keys(planetData));

	

	
    	var divContainerElement = document.querySelector("#divcontainer")!
	var sun: AstroObject;
	const initialData = planetData as Record<string, AstroObjectConfig>;
	let types = ["O", "B", "A", "F", "G", "K", "M"];
	Object.entries(initialData).forEach(([key, data]) => {
		// Get WebGLShape
		let size = data.radius/696349
		let tilt = data.axialTilt;
		let rSpeed = data.rotationSpeed;
		let shape = new WebGLShape(vec3.create(), 
					  size,
					vec3.fromValues(0,1,0),
					  glMatrix.toRadian(0),
					  tilt,
					  rSpeed,
					  gl,
					  posAttrib,
					  colorAttrib);
		let lodManager = new LODManager(shape, divContainerElement, data.name, user, "planet", 0, "");
		let x0 = Big((curEphemeris[key].xPos).toString()).multiply(Big("10").pow((curEphemeris[key].xPosExpn), new MC(20)));
		let y0 = Big((curEphemeris[key].yPos).toString()).multiply(Big("10").pow((curEphemeris[key].yPosExpn), new MC(20)));
		let z0 = Big((curEphemeris[key].zPos).toString()).multiply(Big("10").pow((curEphemeris[key].zPosExpn), new MC(20)));
		let position = bVec3.fromValues(x0.toString(), z0.toString(), y0.negate().toString());
		bVec3.scale(position, position, Big("1000"));

		let xV0 = Big((curEphemeris[key].xVel).toString()).multiply(Big("10").pow((curEphemeris[key].xVelExpn), new MC(20)));
		let yV0 = Big((curEphemeris[key].yVel).toString()).multiply(Big("10").pow((curEphemeris[key].yVelExpn), new MC(20)));
		let zV0 = Big((curEphemeris[key].zVel).toString()).multiply(Big("10").pow((curEphemeris[key].zVelExpn), new MC(20)));
		let velocity = bVec3.fromValues(xV0.toString(), zV0.toString(), yV0.negate().toString());
		bVec3.scale(velocity, velocity, Big("1000"));

		let acceleration = bVec3.create();

		let name = data.name;
		let mass = Big(eval(data.mass).toString());
		let pRadius = 1;
		let eRadius = 1;
		let astroObject = new AstroObject(position,
						 velocity,
						 acceleration,
						 name,
						 mass,
						 data.systemSpace,
						 data.subsystem,
						 pRadius,
						 eRadius,
						 lodManager);
		astroObject._lodManager.setAstroObject(astroObject);



		//let newObj = new AstroObject(position, velocity, acceleration, name, mass, pRadius, eRadius, lodManager);
		if (astroObject.name == "Sun") {
			sun = astroObject;
		}
		ret.push(astroObject);
	});
	
	
	const starsData = starData as Record<string, StarConfig>;
	Object.entries(starsData).forEach(([key, data]) => {
		let size = 1;
		let tilt = 0;
		let rSpeed = 0;
		let shape = new WebGLShape(vec3.create(), 
					size,
					vec3.fromValues(0,1,0),
					glMatrix.toRadian(0),
					tilt,
					rSpeed,
					gl,
					posAttrib,
					colorAttrib);
	
		//let data = new StarConfig((Math.random() * 100000).toString(), "", typ, (Math.random() * 7), 1, (Math.random() * 700000), [(Math.random() * 24), (Math.random() * 60), (Math.random() * 60)], [negFlag * (Math.random()*90), Math.random() * 60, Math.random() * 60]);
		let lodManager = new LODManager(shape, divContainerElement, data.name, user, data.spectralType, 6, data.spectralType);
		
		let alpha = (data.ra[0] + (data.ra[1]/60) + (data.ra[2]/3600)) * 15 * (Math.PI/180)
		let delta = (data.dec[0] + (data.dec[1]/60) + (data.dec[2]/3600)) * (Math.PI/180)
		let dist = Big(data.d.toString()).multiply(Big("9.461").multiply(Big("10").pow(15)))
		let x0 = dist.multiply(Big(Math.cos(delta).toString()).multiply(Big(Math.cos(alpha).toString()))).toString();
		let y0 = dist.multiply(Big(Math.cos(delta).toString()).multiply(Big(Math.sin(alpha).toString()))).toString();
		let z0 = dist.multiply(Big(Math.sin(delta).toString())).toString();
		let position = bVec3.fromValues(x0, z0, y0);

		let velocity = bVec3.fromValues("0", "0", "0");

		let acceleration = bVec3.create();

		let name = data.name;
		let mass = Big(data.mass.toString()).multiply(Big("1.989").multiply(Big("10").pow(30)));
		let pRadius = 1;
		let eRadius = 1;

		let astroObject = new AstroObject(position,
					velocity,
					acceleration,
					name,
					mass,
					0,
					[],
					pRadius,
					eRadius,
					lodManager);
		astroObject._lodManager.setAstroObject(astroObject);

		ret.push(astroObject);
		
		sun.subsystem.push(name);
	});
	
	
	return ret;
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
