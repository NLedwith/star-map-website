import { vec3, ReadonlyVec3, mat4, quat } from "gl-matrix";
import { showError, createStaticVertexBuffer, createStaticIndexBuffer } from "../utils/gl-utils";
import { Sphere, create3dPosColorInterleavedVao } from "../geometry";

export class WebGLShape {
	
	private _matWorld: mat4;
	private _scaleVec: vec3;
	private _rotation: quat;
	public readonly vao: WebGLVertexArrayObject;
	public readonly numIndices: number;

	constructor(
		private _pos: vec3,
		private _scale: number,
		private _rotationAxis: vec3,
		private _yRotationAngle: number,
		private _zRotationAngle: number,
		private _rotationSpeed: number,
		gl: WebGL2RenderingContext,
		posAttrib: number, 
		colorAttrib: number) {

		this._matWorld = mat4.create();
		this._scaleVec = vec3.create();
		this._rotation = quat.create();

		let ellipsoid = new Sphere(36, 36, 1, 1);
		let ellipsoidVertices = createStaticVertexBuffer(gl, ellipsoid.vertices);
		let ellipsoidIndices = createStaticIndexBuffer(gl, ellipsoid.indices);

		if (!ellipsoidVertices || !ellipsoidIndices) {
			throw new Error(`Failed to create geo: ellipsoid (v=${!!ellipsoidVertices}, i=${ellipsoidIndices})`);
		}
		
		let ellipsoidVao = create3dPosColorInterleavedVao(gl, ellipsoidVertices, ellipsoidIndices, posAttrib, colorAttrib);
		if (!ellipsoidVao) {
			throw new Error(`Failed to create geo: ellipsoid=${!!ellipsoidVao}`);
		}
		this.vao = ellipsoidVao;
		this.numIndices = ellipsoid.indices.length;
	}

	public draw(
		gl: WebGL2RenderingContext, 
		matWorldUniform: WebGLUniformLocation,
		drawPos: vec3, 
		dt: number) {
		this._rotate(dt);

		let iQuat = quat.create();
		let yQuat = quat.create();
		let zQuat = quat.create();

		quat.setAxisAngle(yQuat, vec3.fromValues(0, 1, 0), this._yRotationAngle);
		quat.setAxisAngle(zQuat, vec3.fromValues(0, 0, 1), this._zRotationAngle);
		quat.multiply(this._rotation, zQuat, yQuat);
		
		vec3.set(this._scaleVec, this._scale, this._scale, this._scale);


		mat4.fromRotationTranslationScale(
			this._matWorld,
			this._rotation,
			drawPos,
			this._scaleVec);

		gl.uniformMatrix4fv(matWorldUniform, false, this._matWorld);

		gl.bindVertexArray(this.vao);
		gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
		gl.bindVertexArray(null);



	}

	private _rotate(dt: number) {
		this._yRotationAngle += (this._rotationSpeed * dt);
		if (this._yRotationAngle >= (2 * Math.PI)) {
			this._yRotationAngle -= (2 * Math.PI)
		}
	}



}

