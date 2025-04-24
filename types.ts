import { Request } from "express";

// declare global {
// 	namespace Express {
// 		interface Request {
// 			user?: {
// 				id: number;
// 			};
// 		}
// 	}
// }

export interface TokenPayload {
	userId: number;
}

export interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
	};
	refreshToken?: string;
}
