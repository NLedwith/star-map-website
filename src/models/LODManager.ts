import { vec3, vec4, mat4 } from "gl-matrix";
import { WebGLShape } from "./WebGLShape";


export class LODManager {
	private _div: HTMLDivElement;	
	constructor(
		private _shape: WebGLShape,	
		divContainerElement: Element, 
	name: string) {
		this._div = document.createElement("div");
		this._div.className = "planet";
		let txt = document.createElement("div");
		txt.className = "text-node";
		let dot = document.createElement("div");
		let textNode = document.createTextNode(name);
		txt.appendChild(textNode);
		this._div.appendChild(txt);
		divContainerElement.appendChild(this._div);
		}

	public draw(dt: number,
		    cameraDistance: number,
		    gl: WebGL2RenderingContext,
		    matWorldUniform: WebGLUniformLocation,
		    newPos: vec3,
		    mvp: mat4) {

		this._shape.draw(gl, matWorldUniform, newPos, dt);
		if (cameraDistance <= 1000000) {
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
				this._div.style.left = `${Math.floor(pixelX)}px`;
				this._div.style.top = `${Math.floor(pixelY)}px`;
			} else {
				this._div.style.visibility = 'hidden';
			}
		}

	}
}
