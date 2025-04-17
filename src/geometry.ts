import { showError } from "./utils/gl-utils";

// Iterate through each sector
// Iterate through each stack
// Get x, y, and z values. Need to tie them together to create faces

class Vertex {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class Sphere {
    vertices: Float32Array;
    indices: Uint16Array;

    constructor(stacks: number, sectors: number, xScalar: number, yScalar: number) {
        let verticesSize = (6*3*sectors)+(6*3*sectors)+(6*4*sectors*(stacks-2));
        let indicesSize = (3*sectors)+(3*sectors)+(6*sectors*(stacks-2)); // need to add extra for bottom indices/vertices
        this.vertices = new Float32Array(verticesSize);
        this.indices = new Uint16Array(indicesSize);

        
        let verts: any[] = [];
        this.calculateVertices(verts, stacks, sectors, xScalar, yScalar);
        

        


        // link top
        let m = 0;
        let n = 0;
        let l = 0;
        let q = 0;
        while (l < verts[0].length) {
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 1.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 1.0;
            this.indices[q] = q;
            q++;
            this.vertices[m++] = verts[0][n].x;
            this.vertices[m++] = verts[0][n].y;
            this.vertices[m++] = verts[0][n].z;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 1.0;
            this.indices[q] = q;
            q++;
            if (n+1 >= verts[0].length) {
                n = 0
            } else {
                n++
            }
            this.vertices[m++] = verts[0][n].x;
            this.vertices[m++] = verts[0][n].y;
            this.vertices[m++] = verts[0][n].z;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 1.0;
            this.indices[q] = q;
            q++;
            l ++
        }
        let tracker = q
        for (let k = 0; k < verts.length-1; k++) {
            for (let n = 0; n < verts[k].length; n++) {
                let tempN = n
                if (tempN + 1 >= verts[k].length) {
                    tempN = -1
                }
                this.vertices[m++] = verts[k][n].x // left corner
                this.vertices[m++] = verts[k][n].y
                this.vertices[m++] = verts[k][n].z
                this.vertices[m++] = 1.0;
                this.vertices[m++] = 0.0;
                this.vertices[m++] = 0.0;
                this.indices[q] = tracker;
                tracker++
                q++;
                this.vertices[m++] = verts[k][tempN+1].x // right corner
                this.vertices[m++] = verts[k][tempN+1].y
                this.vertices[m++] = verts[k][tempN+1].z
                this.vertices[m++] = 1.0;
                this.vertices[m++] = 0.0;
                this.vertices[m++] = 0.0;
                let rightCornerIndex = tracker;
                this.indices[q] = rightCornerIndex;
                tracker++
                q++;
                this.vertices[m++] = verts[k+1][n].x // bottom left corner
                this.vertices[m++] = verts[k+1][n].y
                this.vertices[m++] = verts[k+1][n].z
                this.vertices[m++] = 0.0;
                this.vertices[m++] = 1.0;
                this.vertices[m++] = 0.0;
                let bottomLeftCornerIndex = tracker;
                this.indices[q] = bottomLeftCornerIndex;
                tracker++
                q++;
                this.indices[q] = rightCornerIndex;
                q++;
                this.indices[q] = bottomLeftCornerIndex;
                q++;
                this.vertices[m++] = verts[k+1][tempN+1].x // bottom right corner
                this.vertices[m++] = verts[k+1][tempN+1].y
                this.vertices[m++] = verts[k+1][tempN+1].z
                this.vertices[m++] = 0.0;
                this.vertices[m++] = 0.0;
                this.vertices[m++] = 1.0;
                this.indices[q] = tracker;
                tracker++
                q++;
            }
        }
        l=0;
        console.log(verts[verts.length-1])
        while (l < verts[verts.length-1].length) {
            this.vertices[m++] = 0.0;
            this.vertices[m++] = -1.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 1.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.indices[q] = tracker;
            tracker++
            q++;
            this.vertices[m++] = verts[verts.length-1][n].x;
            this.vertices[m++] = verts[verts.length-1][n].y;
            this.vertices[m++] = verts[verts.length-1][n].z;
            this.vertices[m++] = 1.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.indices[q] = tracker;
            tracker++
            q++;
            if (n+1 >= verts[0].length) {
                n = 0
            } else {
                n++
            }
            this.vertices[m++] = verts[verts.length-1][n].x;
            this.vertices[m++] = verts[verts.length-1][n].y;
            this.vertices[m++] = verts[verts.length-1][n].z;
            this.vertices[m++] = 1.0;
            this.vertices[m++] = 0.0;
            this.vertices[m++] = 0.0;
            this.indices[q] = tracker;
            tracker++
            q++;
            l++
            console.log(m);
        }
        // link middle
        // link bottom\
        console.log(this.vertices)
        console.log(this.indices)
    }
    private calculateVertices(verts: any[], stacks: number, sectors: number, xScalar: number, yScalar: number) {
        let stackStep = 180/stacks;
        let sectorStep = 360/sectors;
        let i = 0;
        let theta = stackStep;
        let thetaRadians: number;
        let phi: number;
        let phiRadians: number;
        let x, y, z: number;
        while (theta < 180) {
            verts[i] = [] as Vertex[];
            phi = 0;
            thetaRadians = (90 - theta) * Math.PI / 180;
            y = yScalar*Math.sin(thetaRadians);
            let tempX = xScalar*Math.cos(thetaRadians);
            while (phi < 360) {
                phiRadians = phi * Math.PI / 180;
                x = tempX * Math.cos(phiRadians);
                z = tempX * Math.sin(phiRadians);
                verts[i].push(new Vertex(x, y, z))
                phi += sectorStep;
            }
            theta += stackStep;
            i++
        }
    }
}


export const SPHERE_VERTICES = new Float32Array([
    0, 1, 0 // Top point
]);

export const PYRAMID_VERTICES = new Float32Array([
    1.0, -1.0, 1.0, 1, 0, 0,
    -1.0, -1.0, 1.0, 1, 0, 0, 
    0.0, 1.0, 0.0, 1, 0, 0, // front

    -1.0, -1.0, 1.0, 0, 1, 0,
    -1.0, -1.0, -1.0, 0, 1, 0,
    0.0, 1.0, 0.0, 0, 1, 0, // left

    1.0, -1.0, 1.0, 0, 0, 1,
    1.0, -1.0, -1.0, 0, 0, 1,
    0.0, 1.0, 0.0, 0, 0, 1, // right

    1.0, -1.0, -1.0, 1, 0, 0,
    -1.0, -1.0, -1.0, 1, 0, 0,
    0.0, 1.0, 0.0, 1, 0, 0, // back

    -1.0, -1.0, -1.0, 0, 1, 0,  
    1.0, -1.0, -1.0, 0, 1, 0,  
    1.0, -1.0, 1.0, 0, 1, 0, 
    -1.0, -1.0, 1.0, 0, 1, 0, // bottom

]);
export const PYRAMID_INDICES = new Uint16Array([
    0, 1, 2,
    3, 4, 5,
    6, 7, 8, 
    9, 10, 11,
    12, 13, 14,
    12, 14, 15, // bottom
]);

export const CUBE_VERTICES = new Float32Array([
    -1.0, -1.0, 1.0, 1, 0, 0,
    1.0, -1.0, 1.0, 1, 0, 0, 
    1.0, 1.0, 1.0, 1, 0, 0, 
    -1.0, 1.0, 1.0, 1, 0, 0,

  // Back face
  -1.0, -1.0, -1.0, 1, 0, 0, 
  -1.0, 1.0, -1.0, 1, 0, 0, 
  1.0, 1.0, -1.0, 1, 0, 0, 
  1.0, -1.0, -1.0, 1, 0, 0,

  // Top face
  -1.0, 1.0, -1.0, 0, 1, 0, 
  -1.0, 1.0, 1.0, 0, 1, 0,  
  1.0, 1.0, 1.0, 0, 1, 0,  
  1.0, 1.0, -1.0, 0, 1, 0, 

  // Bottom face
  -1.0, -1.0, -1.0, 0, 1, 0,  
  1.0, -1.0, -1.0, 0, 1, 0,  
  1.0, -1.0, 1.0, 0, 1, 0, 
  -1.0, -1.0, 1.0, 0, 1, 0, 

  // Right face
  1.0, -1.0, -1.0, 0, 0, 1,  
  1.0, 1.0, -1.0, 0, 0, 1,  
  1.0, 1.0, 1.0, 0, 0, 1,  
  1.0, -1.0, 1.0, 0, 0, 1, 

  // Left face
  -1.0, -1.0, -1.0, 0, 0, 1,  
  -1.0, -1.0, 1.0, 0, 0, 1,  
  -1.0, 1.0, 1.0, 0, 0, 1,  
  -1.0, 1.0, -1.0, 0, 0, 1, 
]);

export const CUBE_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3, // front
    4, 5, 6,
    4, 6, 7, // back
    8, 9, 10,
    8, 10, 11, // top
    12, 13, 14,
    12, 14, 15, // bottom
    16, 17, 18,
    16, 18, 19, // right
    20, 21, 22,
    20, 22, 23, // left
]);

export const TABLE_VERTICES = new Float32Array([
    // Top face
    -10.0, 0.0, -10.0, 0.2, 0.2, 0.2,
    -10.0, 0.0, 10.0, 0.2, 0.2, 0.2,
    10.0, 0.0, 10.0, 0.2, 0.2, 0.2,
    10.0, 0.0, -10.0, 0.2, 0.2, 0.2,
]);

export const TABLE_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3, // top
]);

export function create3dPosColorInterleavedVao(
    gl: WebGL2RenderingContext,
    vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer,
    posAttrib: number, colorAttrib: number) {
    const vao = gl.createVertexArray();
    if (!vao) {
        showError('Failed to create VAO');
        return null;
    }

    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(posAttrib);
    gl.enableVertexAttribArray(colorAttrib);

    // Interleaved format: (x, y, z, r, g, b) (all f32)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(
        posAttrib, 3, gl.FLOAT, false,
        6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(
        colorAttrib, 3, gl.FLOAT, false,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bindVertexArray(null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return vao;
}
