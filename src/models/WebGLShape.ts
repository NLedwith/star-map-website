
export class WebGLShape {
	
	private _matWorld: mat4;
	private _scaleVec = vec3;
	private _rotation = quat;

	constructor(
		private _pos: vec3,
		private _scale: number,
		private _rotationAxis: vec3,
		private _yRotationAngle: number,
		private _zRotationAngle: number,
		private _rotationSpeed: number,
		private _orbitLocation: number,
		private _orbitDistance: number,
		public readonly vao: WebGLVertexArrayObject,
		public readonly numIndices: number) {
		this._matWorld = mat4.create();
		this._scaleVec = vec3.create();
		this._rotation = quat.create();
	}

	public draw(
		gl: WebGL2RenderingContext, 
		matWorldUniform: WebGLUniformLocation,
		newPos: vec3, 
		dt: number) {
		this._rotate(dt);
		this._pos = newPos;

		let iQuat = quat.create();
		let yQuat = quat.create();
		let zQuat = quat.create();

		quat.setAxisAngle(yQuat, vec3.fromValues(0, 1, 0), this._yRotationAngle);
		quat.setAxisAngle(zQuat, vec3.fromValues(0, 0, 1), this._zRotationAngle);
		quat.multiply(this._rotation, zQuat, yQuat);

		let drawPos = vec3.create();
		vec3.scale(drawPos, this._pos, 10**-9);

		mat4.fromRotationTranslationScale(
			this._matWorld,
			this._rotation,
			drawPos,
			this._scaleVec);

		gl.uniformMatrix4fv(matWorldUniform, false, this._matWorld);

		gl.bindVertexArray(this.vao);
		gl.drawElements(gl.TRIANGLES, this._numIndices, gl.UNSIGNED_SHORT, 0);
		gl.bindVertexArray(null);



	}

	private _rotate(dt: number) {
		this._yRotationAngle += (this._rotationSpeed * dt);
		if (this._yRotationAngle >= (2 * Math.PI)) {
			this._yRotationAngle -= (2 * Math.PI)
		}
	}



}

