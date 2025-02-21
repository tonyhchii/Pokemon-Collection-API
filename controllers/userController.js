const pool = require("../db/db");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

// Create a new user
const createUser = async (req, res) => {
  const { username, email, password, display_name } = req.body;

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(
      "Insert query:",
      `
        INSERT INTO users (username, email, password, display_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, display_name, created_at;
      `
    );
    console.log("Values:", [
      username,
      email,
      hashedPassword,
      display_name || username,
    ]);

    const query = `
      INSERT INTO users (username, email, password, display_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, display_name, created_at;
    `;
    const values = [username, email, hashedPassword, display_name];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]); // Return user data without password
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const query =
      "SELECT id, username, email, display_name, created_at FROM users;";
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { createUser, getUsers };
