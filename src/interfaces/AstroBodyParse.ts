export interface AstroBodyParse {
	name: string;
	mass?: number | string;
	radius?: number;
	axialTilt?: number;
	rotationSpeed?: number;
	spectralType?: string;
	d?: number;
	ra?: [number, number, number];
	dec?: [number, number, number];
}
