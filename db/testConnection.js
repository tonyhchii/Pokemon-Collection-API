const pool = require("./db");

const testConnection = async () => {
  try {
    const res = await pool.query("SELECT current_database()");
    console.log("Connected to database:", res.rows[0].current_database);
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

testConnection();
