

export class LODManager {
	
	constructor(
		private _shape: WebGLShape,	
		private _div: HTML DivElement) {}

	public draw(cameraDistance: number,
		    gl: WebGL2RenderingContext,
		    matWorldUniform: WebGLUniformLocation,
		    newPos: vec3,
		    mvp: mat4) {
		if (cameraDistance <= 1000) {
			this._shape.draw(gl, matWorldUniform, newPos, dt);
		} else {
			let clipspace = vec4.create();
			vec4.transformMat4(clipspace, [drawPos[0], drawPos[1], drawPos[2], 1], mvp);
			clipspace[0] /= clipspace[2];
			clipspace[1] /= clipspace[2];

			const pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
			const pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;

			if (clipspace[2] >= 0) {
				this._div.style.left = `${Math.floor(pixelX)}px`;
				this._div.style.top = `${Math.floor(pixelY)}px`;
			}
		}

	}
}
