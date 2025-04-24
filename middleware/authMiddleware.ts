import { Response, NextFunction, RequestHandler } from "express";
import { TokenPayload, AuthenticatedRequest } from "../types";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware: RequestHandler = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		res.status(401).json({ message: "Требуется авторизация" });
		return;
	}

	try {
		const payload = jwt.verify(
			token,
			process.env.token_secret as string
		) as TokenPayload;
		(req as AuthenticatedRequest).user = { id: payload.userId };
		next();
	} catch (err) {
		res.status(401).json({ message: "Токен недействителен" });
	}
};

export default authMiddleware;
