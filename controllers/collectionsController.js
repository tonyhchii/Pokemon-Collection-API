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
    quantity = 1,
    set_name,
    set_number,
    image_url,
    tcgplayer_url,
    prices,
  } = req.body;

  try {
    const query = `
      INSERT INTO cards (id, collection_id, quantity, name, series, set_name, set_number, image_url, tcgplayer_url, prices)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      id,
      collectionId,
      quantity,
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
    const collectionQuery = `
      SELECT name FROM collections WHERE id = $1;
    `;
    const collectionResult = await pool.query(collectionQuery, [collectionId]);

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const collectionName = collectionResult.rows[0].name;

    const query = `
      SELECT * FROM cards
      WHERE collection_id = $1;
    `;
    const cardsResult = await pool.query(query, [collectionId]);

    res.status(200).json({ collectionName, cards: cardsResult.rows });
  } catch (error) {
    console.error("Error fetching cards from collection:", error.message);
    res.status(500).json({ error: "Failed to fetch cards from collection" });
  }
};

const updateCardPrices = async (req, res) => {
  const { collectionId, cardId } = req.params; // Extract collectionId and cardId from params
  const { prices } = req.body; // Get the new prices from the request body

  if (!prices) {
    return res.status(400).json({ error: "Prices are required" });
  }

  try {
    // Check if the card exists in the collection
    const cardCheckQuery = `
        SELECT * FROM cards WHERE id = $1 AND collection_id = $2;
      `;
    const cardCheckResult = await pool.query(cardCheckQuery, [
      cardId,
      collectionId,
    ]);

    if (cardCheckResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Card not found in this collection" });
    }

    // Update the prices for the specified card
    const updatePricesQuery = `
        UPDATE cards
        SET prices = $1
        WHERE id = $2 AND collection_id = $3
        RETURNING *;
      `;
    const updatedCardResult = await pool.query(updatePricesQuery, [
      JSON.stringify(prices), // Ensure prices are stored as JSON
      cardId,
      collectionId,
    ]);

    res.status(200).json(updatedCardResult.rows[0]);
  } catch (error) {
    console.error("Error updating card prices:", error.message);
    res.status(500).json({ error: "Failed to update card prices" });
  }
};

module.exports = {
  createCollection,
  addCardToCollection,
  getCardsInCollection,
  getCollectionsForUser,
  updateCardPrices,
};
