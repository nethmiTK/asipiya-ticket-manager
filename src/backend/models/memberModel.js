import { connectToDatabase } from "../config/db.js";

export const getAllUsers = async () => {
  const db = await connectToDatabase();
  const [rows] = await db.execute("SELECT * FROM users");
  return rows;
};

export const addUser = async (name, email, role) => {
  const db = await connectToDatabase();
  const [result] = await db.execute(
    "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
    [name, email, role]
  );
  return result;
};
