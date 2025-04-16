
// Format for kinematic data of an AstroObject at a certain time
// Each variable has a base that is a float64 and an exponent(Expn) which is an integer
export interface AstroObjectState {
	xPos: number;
	xPosExpn: number;
	yPos: number;
	yPosExpn: number;
	zPos: number;
	zPosExpn: number;
	xVel: number;
	xVelExpn: number;
	yVel: number;
	yVelExpn: number;
	zVel: number;
	zVelExpn: number;
}
