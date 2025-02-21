const pool = require("../db/db");

// Create a new collection for a user
const createCollection = async (req, res) => {
  const { name } = req.body; // Getting collection name from the request body
  const { userId } = req.params; // Getting userId from the URL params

  console.log(userId, name);

  try {
    // Check if the user exists
    const userCheckQuery = `
        SELECT id FROM users WHERE id = $1;
      `;
    const userResult = await pool.query(userCheckQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the user exists, proceed to create the collection
    const query = `
        INSERT INTO collections (name, user_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
    const result = await pool.query(query, [name, userId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating collection:", error.message);
    res.status(500).json({ error: "Failed to create collection" });
  }
};

// Get all collections for a specific user
const getCollectionsForUser = async (req, res) => {
  const { userId } = req.params; // Get userId from the URL params

  try {
    const query = `
      SELECT * FROM collections
      WHERE user_id = $1;
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No collections found for this user" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching collections for user:", error.message);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

// Add a card to a collection
const addCardToCollection = async (req, res) => {
  const { collectionId } = req.params;
  const {
    id,
    name,
    series,
    set_name,
    set_number,
    image_url,
    tcgplayer_url,
    prices,
  } = req.body;

  try {
    const query = `
      INSERT INTO cards (id, collection_id, name, series, set_name, set_number, image_url, tcgplayer_url, prices)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      id,
      collectionId,
      name,
      series,
      set_name,
      set_number,
      image_url,
      tcgplayer_url,
      JSON.stringify(prices),
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding card to collection:", error.message);
    res.status(500).json({ error: "Failed to add card to collection" });
  }
};

// Get all cards in a collection
const getCardsInCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const query = `
      SELECT * FROM cards
      WHERE collection_id = $1;
    `;
    const result = await pool.query(query, [collectionId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching cards from collection:", error.message);
    res.status(500).json({ error: "Failed to fetch cards from collection" });
  }
};

module.exports = {
  createCollection,
  addCardToCollection,
  getCardsInCollection,
  getCollectionsForUser, // Add the new function to module exports
};
