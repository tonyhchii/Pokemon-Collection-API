const express = require("express");
const router = express.Router();
const cardRouter = require("./cards");

router.use("/cards", cardRouter);

module.exports = router;
