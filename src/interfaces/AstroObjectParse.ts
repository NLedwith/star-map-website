import { AstroBodyParse } from "./AstroBodyParse";

export interface AstroObjectParse {
	name: string;
	designations: string[];
	systemSpace: number;
	containsDynamicBodies: boolean;
	isDynamicObject: boolean;
	primaryBodies: string[];
	astroBodies: AstroBodyParse[];
	astroObjects: AstroObjectParse[];
}
