const express = require("express");
const router = express.Router();
const collectionsController = require("../controllers/collectionsController");

// POST /collections/:collectionId/cards - Add a card to a collection
router.post("/:collectionId/cards", collectionsController.addCardToCollection);

// GET /collections/:collectionId/cards - Get all cards in a collection
router.get("/:collectionId/cards", collectionsController.getCardsInCollection);

router.put(
  "/:collectionId/cards/:cardId",
  collectionsController.updateCardPrices
);

module.exports = router;
