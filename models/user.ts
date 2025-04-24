import pool from "../db";
import bcrypt from "bcryptjs";

interface UserRow {
	id: number;
	login: string;
	password: string;
}

const User = {
	async create(login: string, passwordHash: string): Promise<number> {
		const [result]: any = await pool.execute(
			"INSERT INTO users (login, password) VALUES (?, ?)",
			[login, passwordHash]
		);
		return result.insertId;
	},

	async findByLogin(login: string): Promise<UserRow | undefined> {
		const [rows]: any = await pool.execute(
			"SELECT * FROM users WHERE login = ?",
			[login]
		);
		return rows[0] as UserRow;
	},

	async findById(id: number): Promise<UserRow | undefined> {
		const [rows]: any = await pool.execute("SELECT * FROM users WHERE id = ?", [
			id,
		]);
		return rows[0] as UserRow;
	},
};

export default User;
