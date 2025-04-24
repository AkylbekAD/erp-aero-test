import { RequestHandler } from "express";
import RefreshToken from "../models/refreshToken";
import { AuthenticatedRequest } from "../types";

export const logoutHandler: RequestHandler = async (req, res) => {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.refreshToken) {
		res.status(400).json({ message: "Refresh токен отсутствует" });
		return;
	}

	await RefreshToken.deactivate(authReq.refreshToken);
	res.json({ message: "Выход выполнен, токен сессии деактивирован" });
};
