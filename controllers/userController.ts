import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types";

export const getUserInfoHandler: RequestHandler = (req, res) => {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.user) {
		res.status(404).json({ message: "User не найден" });
		return;
	}

	res.json({ id: authReq.user.id });
};
