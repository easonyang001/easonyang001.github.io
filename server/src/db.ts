import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0] ?? null;
}

export async function createUser(username: string, passwordHash: string): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
    [username, passwordHash]
  );
  return result.rows[0];
}
