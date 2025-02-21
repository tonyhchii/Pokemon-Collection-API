// Load environment variables from .env file
require("dotenv").config();

// Import required modules
const express = require("express");
const indexRouter = require("./routes/index"); // Import the router

// Create an Express application
const app = express();

// Set the port from environment variables or default to 3000
const port = process.env.PORT || 3001;

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Use the router for all routes starting with '/'
app.use("/", indexRouter);

// Basic route for the root URL
app.get("/", (req, res) => {
  res.send("Pokemon Collections");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
