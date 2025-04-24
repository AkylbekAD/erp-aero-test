import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import RefreshToken from "../models/refreshToken";

dotenv.config();

interface TokenPayload {
	userId: number;
}

interface AuthenticatedRequest extends Request {
	refreshToken?: string;
	user?: {
		id: number;
	};
	cookies: {
		refresh_token?: string;
	};
}

const refreshTokenAuth = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const refreshToken =
		(req.headers["x-refresh-token"] as string) || req.cookies?.refresh_token;

	if (!refreshToken) {
		res.status(401).json({ message: "Refresh token обязателен для logout" });
		return;
	}

	const stored = await RefreshToken.findActive(refreshToken);

	if (!stored) {
		res.status(401).json({ message: "Токен не найден или неактивен" });
		return;
	}

	let payload: TokenPayload;

	try {
		payload = jwt.verify(
			refreshToken,
			process.env.refresh_token_secret as string
		) as TokenPayload;
	} catch (err) {
		await RefreshToken.deactivate(refreshToken);
		res.status(401).json({ message: "Refresh token недействителен" });
		return;
	}

	req.refreshToken = refreshToken;
	req.user = { id: payload.userId };
	next();
};

export default refreshTokenAuth;
