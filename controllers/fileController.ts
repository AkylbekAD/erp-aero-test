import { Response } from "express";
import path from "path";
import fs from "fs";
import pool from "../db";
import { AuthenticatedRequest } from "../types";

function assertUser(
	req: AuthenticatedRequest
): asserts req is AuthenticatedRequest & { user: { id: number } } {
	if (!req.user) throw new Error("User не найден");
}

function assertFile(
	req: AuthenticatedRequest
): asserts req is AuthenticatedRequest & { file: Express.Multer.File } {
	if (!req.file) throw new Error("Файл обязателен");
}

export const postFile = async (req: AuthenticatedRequest, res: Response) => {
	try {
		assertUser(req);
		assertFile(req);

		const ext = path.extname(req.file.originalname).replace(".", "");
		const {
			mimetype: mime,
			size,
			filename,
			originalname: original_name,
		} = req.file;

		await pool.execute(
			"INSERT INTO files (user_id, filename, original_name, extension, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)",
			[req.user.id, filename, original_name, ext, mime, size]
		);

		res.json({ message: "Файл загружен", filename });
	} catch (e: any) {
		res.status(500).json({ message: "Ошибка загрузки файла", error: e.message });
	}
};

export const getFiles = async (req: AuthenticatedRequest, res: Response) => {
	try {
		assertUser(req);
		const list_size = Number(req.query.list_size) || 10;
		const page = Number(req.query.page) || 1;
		const offset = (page - 1) * list_size;

		const [files]: any = await pool.query(
			`SELECT id, original_name, extension, mime_type, size, upload_date FROM files WHERE user_id = ? ORDER BY upload_date DESC LIMIT ${list_size} OFFSET ${offset}`,
			[req.user.id]
		);

		res.json({ files });
	} catch (e: any) {
		res
			.status(500)
			.json({ message: "Ошибка получения файлов", error: e.message });
	}
};

export const getFile = async (req: AuthenticatedRequest, res: Response) => {
	try {
		assertUser(req);
		const [rows]: any = await pool.execute(
			"SELECT id, original_name, extension, mime_type, size, upload_date FROM files WHERE id = ? AND user_id = ?",
			[req.params.id, req.user.id]
		);

		if (!rows[0]) return res.status(404).json({ message: "Файл не найден" });
		res.json(rows[0]);
	} catch (e: any) {
		res.status(500).json({ message: "Ошибка получения файла", error: e.message });
	}
};

export const downloadFile = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		assertUser(req);
		const [rows]: any = await pool.execute(
			"SELECT filename, original_name FROM files WHERE id = ? AND user_id = ?",
			[req.params.id, req.user.id]
		);

		if (!rows[0]) return res.status(404).json({ message: "Файл не найден" });

		const filePath = path.join(__dirname, "../uploads", rows[0].filename);
		if (!fs.existsSync(filePath))
			return res.status(404).json({ message: "Файл отсутствует на сервере" });

		res.download(filePath, rows[0].original_name);
	} catch (e: any) {
		res.status(500).json({ message: "Ошибка загрузки файла", error: e.message });
	}
};

export const deleteFile = async (req: AuthenticatedRequest, res: Response) => {
	try {
		assertUser(req);
		const [rows]: any = await pool.execute(
			"SELECT filename FROM files WHERE id = ? AND user_id = ?",
			[req.params.id, req.user.id]
		);

		if (!rows[0]) return res.status(404).json({ message: "Файл не найден" });

		const filePath = path.join(__dirname, "../uploads", rows[0].filename);
		if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

		await pool.execute("DELETE FROM files WHERE id = ? AND user_id = ?", [
			req.params.id,
			req.user.id,
		]);
		res.json({ message: "Файл удалён" });
	} catch (e: any) {
		res.status(500).json({ message: "Ошибка удаления файла", error: e.message });
	}
};

export const putFile = async (req: AuthenticatedRequest, res: Response) => {
	try {
		assertUser(req);
		assertFile(req);

		const [rows]: any = await pool.execute(
			"SELECT filename FROM files WHERE id = ? AND user_id = ?",
			[req.params.id, req.user.id]
		);

		if (!rows[0]) return res.status(404).json({ message: "Файл не найден" });

		const oldFilePath = path.join(__dirname, "../uploads", rows[0].filename);
		if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

		const ext = path.extname(req.file.originalname).replace(".", "");
		const {
			mimetype: mime,
			size,
			filename,
			originalname: original_name,
		} = req.file;

		await pool.execute(
			"UPDATE files SET filename=?, original_name=?, extension=?, mime_type=?, size=?, upload_date=NOW() WHERE id=? AND user_id=?",
			[filename, original_name, ext, mime, size, req.params.id, req.user.id]
		);

		res.json({ message: "Файл обновлён", filename });
	} catch (e: any) {
		res
			.status(500)
			.json({ message: "Ошибка обновления файла", error: e.message });
	}
};
