const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cardsController");

// GET /cards route
router.get("/", cardsController.getCards);

module.exports = router;
