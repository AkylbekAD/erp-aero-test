import { RowDataPacket, ResultSetHeader, Pool } from "mysql2/promise";
import pool from "../db";

interface RefreshTokenRecord extends RowDataPacket {
	id: number;
	user_id: number;
	token: string;
	device: string | null;
	is_active: boolean;
	created_at: Date;
}

const RefreshToken = {
	/**
	 * Creates a new refresh token in the database
	 * @param userId The ID of the user
	 * @param token The refresh token string
	 * @param device The device information or null
	 * @returns The ID of the newly created refresh token
	 */
	async create(
		userId: number,
		token: string,
		device: string | null = null
	): Promise<number> {
		const [result] = await pool.execute<ResultSetHeader>(
			"INSERT INTO refresh_tokens (user_id, token, device, is_active) VALUES (?, ?, ?, TRUE)",
			[userId, token, device]
		);
		return result.insertId;
	},

	/**
	 * Deactivates a refresh token
	 * @param token The refresh token to deactivate
	 */
	async deactivate(token: string): Promise<void> {
		await pool.execute(
			"UPDATE refresh_tokens SET is_active = FALSE WHERE token = ?",
			[token]
		);
	},

	/**
	 * Finds an active refresh token
	 * @param token The refresh token to find
	 * @returns The token record if found and active, undefined otherwise
	 */
	async findActive(token: string): Promise<RefreshTokenRecord | undefined> {
		const [rows] = await pool.execute<RefreshTokenRecord[]>(
			"SELECT * FROM refresh_tokens WHERE token = ? AND is_active = TRUE",
			[token]
		);
		return rows[0];
	},

	/**
	 * Deactivates all refresh tokens for a user
	 * @param userId The ID of the user
	 */
	async deactivateAllForUser(userId: number): Promise<void> {
		await pool.execute(
			"UPDATE refresh_tokens SET is_active = FALSE WHERE user_id = ?",
			[userId]
		);
	},
};

export default RefreshToken;
