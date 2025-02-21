const express = require("express");
const userController = require("../controllers/userController");
const collectionsController = require("../controllers/collectionsController");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("display_name").optional().isString(),
  ],
  userController.createUser
);

router.get("/", userController.getUsers);

router.get("/:userId/collections", collectionsController.getCollectionsForUser);

router.post("/:userId/collections", collectionsController.createCollection);

module.exports = router;
