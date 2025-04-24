import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import RefreshToken from "../models/refreshToken";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

interface TokenPayload {
	userId: number;
}

interface UserData {
	id: number;
	password: string;
}

const generateTokens = (
	userId: number
): { accessToken: string; refreshToken: string } => {
	const accessToken = jwt.sign(
		{ userId } as TokenPayload,
		process.env.token_secret as string,
		{
			expiresIn: "10m",
		}
	);
	const refreshToken = jwt.sign(
		{ userId } as TokenPayload,
		process.env.refresh_token_secret as string,
		{
			expiresIn: "7d",
		}
	);
	return { accessToken, refreshToken };
};

export const signup = async (req: Request, res: Response): Promise<any> => {
	try {
		const { id, password } = req.body;
		if (!id || !password) {
			return res.status(400).json({ message: "id и пароль обязательны" });
		}
		const exist = await User.findByLogin(id);
		if (exist) {
			return res.status(409).json({ message: "Пользователь уже существует" });
		}
		const hash = await bcrypt.hash(password, 10);
		const userId = await User.create(id, hash);
		const tokens = generateTokens(userId);
		await RefreshToken.create(
			userId,
			tokens.refreshToken,
			req.headers["user-agent"] || null
		);
		return res.status(201).json({
			access_token: tokens.accessToken,
			refresh_token: tokens.refreshToken,
		});
	} catch (e: any) {
		return res
			.status(500)
			.json({ message: "Ошибка регистрации", error: e.message });
	}
};

export const signin = async (req: Request, res: Response): Promise<any> => {
	try {
		const { id, password } = req.body;
		if (!id || !password) {
			return res.status(400).json({ message: "id и пароль обязательны" });
		}
		const user = await User.findByLogin(id);
		if (!user) {
			return res.status(401).json({ message: "Неверный id или пароль" });
		}
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return res.status(401).json({ message: "Неверный id или пароль" });
		}
		const tokens = generateTokens(user.id);
		await RefreshToken.create(
			user.id,
			tokens.refreshToken,
			req.headers["user-agent"] || null
		);
		return res.status(200).json({
			access_token: tokens.accessToken,
			refresh_token: tokens.refreshToken,
		});
	} catch (e: any) {
		return res.status(500).json({ message: "Ошибка входа", error: e.message });
	}
};

export const newToken = async (req: Request, res: Response): Promise<any> => {
	try {
		const refresh_token =
			(req.headers["x-refresh-token"] as string) || req.body.refresh_token;
		if (!refresh_token) {
			return res.status(400).json({ message: "refresh_token обязателен" });
		}
		const stored = await RefreshToken.findActive(refresh_token);
		if (!stored) {
			return res.status(401).json({ message: "Токен не найден или неактивен" });
		}
		let payload: TokenPayload;
		try {
			payload = jwt.verify(
				refresh_token,
				process.env.refresh_token_secret as string
			) as TokenPayload;
		} catch (err) {
			await RefreshToken.deactivate(refresh_token);
			return res.status(401).json({ message: "refresh_token недействителен" });
		}
		const tokens = generateTokens(payload.userId);
		await RefreshToken.create(
			payload.userId,
			tokens.refreshToken,
			req.headers["user-agent"] || null
		);
		await RefreshToken.deactivate(refresh_token);
		return res.status(200).json({
			access_token: tokens.accessToken,
			refresh_token: tokens.refreshToken,
		});
	} catch (e: any) {
		return res.status(500).json({
			message: "Ошибка обновления токена",
			error: e.message,
		});
	}
};
