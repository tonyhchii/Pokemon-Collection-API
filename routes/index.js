const express = require("express");
const router = express.Router();
const cardRouter = require("./cards");
const collectionsRouter = require("./collections");
const userRouter = require("./users");

router.use("/cards", cardRouter);
router.use("/collections", collectionsRouter);
router.use("/users", userRouter);

module.exports = router;
