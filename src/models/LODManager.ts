import { vec3, vec4, mat4 } from "gl-matrix";
import { WebGLShape } from "./WebGLShape";
import { UserController } from "../controllers/UserController";
import { AstroObject } from "./AstroObject";


export class LODManager {
	private _div: HTMLDivElement;	
	public astroObject: AstroObject | null;
	constructor(
		private _shape: WebGLShape,	
		divContainerElement: Element, 
	name: string, public userController: UserController) {
		this._div = document.createElement("div");
		if (name == "Sun") {
			this._div.className = "sun";
		} else {
			this._div.className = "planet";
		}
		let txt = document.createElement("div");
		txt.className = "text-node";
		let dot = document.createElement("div");
		let textNode = document.createTextNode(name);
		txt.appendChild(textNode);
		this._div.appendChild(txt);
		divContainerElement.appendChild(this._div);
		this.astroObject = null;
		}
	public setAstroObject(ast: AstroObject) {	
		this.astroObject = ast;
		let that = this;
		this._div.onclick = function() { if(that.astroObject != null) {that.userController.setCoupledAstroObject(that.astroObject)}};
	}
	public testClick() {
		if (this.astroObject != null) {
			this.userController.setCoupledAstroObject(this.astroObject);
		} else {
			console.log("No coupled object", this.astroObject);
		}
	}
	public draw(dt: number,
		    cameraDistance: number,
		    gl: WebGL2RenderingContext,
		    matWorldUniform: WebGLUniformLocation,
		    newPos: vec3,
		    mvp: mat4,
		   drawOrder: number) {

		this._shape.draw(gl, matWorldUniform, newPos, dt);
		if (cameraDistance <= 10000) {
			this._div.style.visibility = 'hidden';
		} else {
			let drawPos = vec3.create();
			vec3.scale(drawPos, newPos, 10**-9);
			let clipspace = vec4.create();
			vec4.transformMat4(clipspace, [drawPos[0], drawPos[1], drawPos[2], 1], mvp);
			clipspace[0] /= clipspace[2];
			clipspace[1] /= clipspace[2];

			let pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
			let pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
			if (clipspace[2] >= 0) {
				this._div.style.visibility = 'visible';
				this._div.style.zIndex = `${drawOrder}`;
				this._div.style.left = `${Math.floor(pixelX)}px`;
				this._div.style.top = `${Math.floor(pixelY)}px`;
			} else {
				this._div.style.visibility = 'hidden';
			}
		}

	}
}
