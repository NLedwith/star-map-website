import { Big, BigDecimal, MathContext, MC, RoundingMode } from "bigdecimal.js";
import { vec3 } from "gl-matrix";

export function create(): BigDecimal[] {
	let out: BigDecimal[] = [Big("0"), Big("0"), Big("0")];
	return out;
}

export function clone(a: BigDecimal[]): BigDecimal[] {
	let out: BigDecimal[] = [a[0], a[1],  a[2]];
	return out;
}

export function length(a: BigDecimal[]): BigDecimal {
	const mc = new MC(20, RoundingMode.CEILING);
	const x: BigDecimal = a[0];
	const y: BigDecimal = a[1];
	const z: BigDecimal = a[2];
	const sumSquares = (((x.multiply(x)).add(y.multiply(y))).add(z.multiply(z)));
	return sumSquares.sqrt(mc);
}

export function fromValues(x: string, y: string, z: string): BigDecimal[] {
	let out: BigDecimal[] = [Big(x), Big(y), Big(z)];
	return out;
}

export function copy(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
}

export function set(out: BigDecimal[], x: BigDecimal, y: BigDecimal, z: BigDecimal): BigDecimal[] {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
}

export function add(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[]): BigDecimal[] {
	const mc = new MC(20);
	out[0] = a[0].add(b[0], mc);
	out[1] = a[1].add(b[1], mc);
	out[2] = a[2].add(b[2], mc);
	return out;
}

export function subtract(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].subtract(b[0]);
	out[1] = a[1].subtract(b[1]);
	out[2] = a[2].subtract(b[2]);
	return out;
}

export function multiply(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].multiply(b[0]);
	out[1] = a[1].multiply(b[1]);
	out[2] = a[2].multiply(b[2]);
	return out;
}


export function divide(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].divide(b[0], 20, RoundingMode.CEILING);
	out[1] = a[1].divide(b[1], 20, RoundingMode.CEILING);
	out[2] = a[2].divide(b[2], 20, RoundingMode.CEILING);
	return out;
}

function getCeilMC(num: BigDecimal): MathContext {
	if(num.precision() == num.scale()) {
		return new MC(1, RoundingMode.CEILING);
	} else {
		return new MC(num.precision()-num.scale(), RoundingMode.CEILING);
	}
}

export function ceil(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].round(getCeilMC(a[0]));
	
	out[1] = a[1].round(getCeilMC(a[1]));
	out[2] = a[2].round(getCeilMC(a[2]));
	return out;
}

function getFloorMC(num: BigDecimal): MathContext {
	if(num.precision() == num.scale()) {
		return new MC(1, RoundingMode.FLOOR);
	} else {
		return new MC(num.precision()-num.scale(), RoundingMode.FLOOR);
	}
}

export function floor(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].round(getFloorMC(a[0]));
	
	out[1] = a[1].round(getFloorMC(a[1]));
	out[2] = a[2].round(getFloorMC(a[2]));
	return out;
}

export function min(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].min(b[0]);
	out[1] = a[1].min(b[1]);
	out[2] = a[2].min(b[2]);
	return out;
}



export function max(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].max(b[0]);
	out[1] = a[1].max(b[1]);
	out[2] = a[2].max(b[2]);
	return out;
}


function getRoundMC(num: BigDecimal): MathContext {
	if(num.greaterThan("0")) {
		if(num.precision() == num.scale()) {
			return new MC(1, RoundingMode.HALF_UP);
		} else {
			return new MC(num.precision()-num.scale(), RoundingMode.HALF_UP);
		}
	} else {
		if(num.precision() == num.scale()) {
			return new MC(1, RoundingMode.HALF_DOWN);
		} else {
			return new MC(num.precision()-num.scale(), RoundingMode.HALF_DOWN);
		}
	}	
}

export function round(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].round(getRoundMC(a[0]));	
	out[1] = a[1].round(getRoundMC(a[1]));
	out[2] = a[2].round(getRoundMC(a[2]));
	return out;
}

export function scale(out: BigDecimal[], a: BigDecimal[], b: BigDecimal): BigDecimal[] {
	out[0] = a[0].multiply(b);
	out[1] = a[1].multiply(b);
	out[2] = a[2].multiply(b);
	return out;
}

export function scaleAndAdd(out: BigDecimal[], a: BigDecimal[], b: BigDecimal[], scale: BigDecimal): BigDecimal[] {
	out[0] = (a[0].add(b[0])).multiply(scale);
	out[1] = (a[1].add(b[1])).multiply(scale);
	out[2] = (a[2].add(b[2])).multiply(scale);
	return out;
}

export function distance(a: BigDecimal[], b: BigDecimal[]): BigDecimal {
	const mc = new MC(20, RoundingMode.CEILING);
	const x = b[0].subtract(a[0]);
	const y = b[1].subtract(a[1]);
	const z = b[2].subtract(a[2]);
	const sumSquares = (((x.multiply(x)).add(y.multiply(y))).add(z.multiply(z)));
	return sumSquares.sqrt(mc);
}

export function squaredDistance(a: BigDecimal[], b: BigDecimal[]): BigDecimal {
	const x = b[0].subtract(a[0]);
	const y = b[1].subtract(a[1]);
	const z = b[2].subtract(a[2]);
	const sumSquares = (((x.multiply(x)).add(y.multiply(y))).add(z.multiply(z)));
	return sumSquares;
}

export function squaredLength(a: BigDecimal[]): BigDecimal {
	const x: BigDecimal = a[0];
	const y: BigDecimal = a[1];
	const z: BigDecimal = a[2];
	const sumSquares = (((x.multiply(x)).add(y.multiply(y))).add(z.multiply(z)));
	return sumSquares;
}

export function negate(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	out[0] = a[0].negate();
	out[1] = a[1].negate();
	out[2] = a[2].negate();
	return out;
}

export function inverse(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	out[0] = Big("1").divide(a[0]);
	out[1] = Big("1").divide(a[1]);
	out[2] = Big("1").divide(a[2]);
	return out;
}

export function normalize(out: BigDecimal[], a: BigDecimal[]): BigDecimal[] {
	let len = squaredLength(a);
	if(len.greaterThan(Big("0"))) {
		len = Big("1").divide(length(a), 20, RoundingMode.CEILING);
	}

	out[0] = a[0].multiply(len);
	out[1] = a[1].multiply(len);
	out[2] = a[2].multiply(len);
	return out;
}

export function zero(out: BigDecimal[]): BigDecimal[] {
	out[0] = Big(0);
	out[1] = Big(0);
	out[2] = Big(0);
	return out;
}

export function getScaledVec3(bVec: BigDecimal[], num: number, power: number): vec3 {
	let sV = create();
	scale(sV, bVec, Big(num.toString()).pow(power, new MC(20)));
	let out = vec3.create();
	out[0] = Number(sV[0].toEngineeringString());
	out[1] = Number(sV[1].toEngineeringString());
	out[2] = Number(sV[2].toEngineeringString());
	return out;
}





