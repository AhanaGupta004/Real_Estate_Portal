const express = require("express");

const {
    addFavorite,
    getMyFavorites,
    removeFavorite
} = require("../controllers/favoriteController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// All favorite routes require login
router.use(authenticateToken);

// Add favorite
router.post("/", addFavorite);

// Get my favorites
router.get("/", getMyFavorites);

// Remove favorite
router.delete("/:property_id", removeFavorite);

module.exports = router;