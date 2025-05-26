import { vec3, vec4, mat4 } from "gl-matrix";
import { WebGLShape } from "./WebGLShape";
import { UserController } from "../controllers/UserController";
import { AstroObject } from "./AstroObject";


export class LODManager {
	private _div: HTMLDivElement;
	private _drawable: HTMLDivElement;	
	public astroObject: AstroObject | null;
	private _isPlanet;
	constructor(
		private _shape: WebGLShape,	
		divContainerElement: Element, public name: string, public userController: UserController, classification: string, public absMag: number, private _type: string) {
		this._isPlanet = false
		this._div = document.createElement("div");
		this._drawable = document.createElement("div");
		if (name == "Sun") {
			this._type = "G"
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "O") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "B") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "A") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "F" || classification == "D") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "G") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "K") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "M") {
			this._div.className = "star-hoverable"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else if (classification == "Y" || classification == "T" || classification == "L") {
			this._div.className = "star-hoverable"
			this._type = "M"
			this._drawable.className = this._type + "-type-dim";
			this._div.appendChild(this._drawable);
		} else {
			this._isPlanet = true;
			this._div.className = classification;
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
		    isVisible: boolean,
		    gl: WebGL2RenderingContext,
		    matWorldUniform: WebGLUniformLocation,
		    drawPos: vec3,
		    mvp: mat4,
		   drawOrder: number, cameraDist: number) {

		
		if (!isVisible) {
			this._div.style.visibility = 'hidden';
		} else {
			let clipspace = vec4.create();
			vec4.transformMat4(clipspace, [drawPos[0], drawPos[1], drawPos[2], 1], mvp);
			clipspace[0] /= clipspace[2];
			clipspace[1] /= clipspace[2];

			let pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
			let pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
			if (clipspace[2] >= 0) {
				let apparentMagnitude = this.absMag + (5 * Math.log10((cameraDist * (10 ** -8))/10)) - 5
				if (!this._isPlanet) {
					if (apparentMagnitude <= -20) {

						this._shape.draw(gl, matWorldUniform, drawPos, dt);
						this._drawable.className = this._type + "-type-near"
					} else if (apparentMagnitude <= -3.5) {
						this._drawable.className = this._type + "-type-very-bright"
					} else if (apparentMagnitude <= 0) {
						this._drawable.className = this._type + "-type-bright"
					} else if (apparentMagnitude <= 7) {
						this._drawable.className = this._type + "-type-dim"
					} else {
						this._drawable.className = this._type + "-type-very-dim"
					}
				} else {
				
					this._shape.draw(gl, matWorldUniform, drawPos, dt);
				}
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
