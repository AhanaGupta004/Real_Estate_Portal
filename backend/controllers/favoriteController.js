const db = require("../config/db");

// ========================================
// ADD PROPERTY TO FAVORITES
// ========================================
const addFavorite = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { property_id } = req.body;

        if (!property_id) {
            return res.status(400).json({
                success: false,
                message: "Property ID is required"
            });
        }

        // Check property exists
        const [properties] = await db.query(
            `SELECT id
             FROM properties
             WHERE id = ?`,
            [property_id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Check if already favorited
        const [existing] = await db.query(
            `SELECT id
             FROM favorites
             WHERE user_id = ?
             AND property_id = ?`,
            [user_id, property_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Property is already in your favorites"
            });
        }

        // Add favorite
        await db.query(
            `INSERT INTO favorites
             (user_id, property_id)
             VALUES (?, ?)`,
            [user_id, property_id]
        );

        res.status(201).json({
            success: true,
            message: "Property added to favorites"
        });

    } catch (error) {
        console.error("Add favorite error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add property to favorites"
        });
    }
};


// ========================================
// GET MY FAVORITES
// ========================================
const getMyFavorites = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [favorites] = await db.query(`
            SELECT
                f.id AS favorite_id,
                p.id AS property_id,
                p.title,
                p.description,
                p.property_type,
                p.listing_type,
                p.price,
                p.location,
                p.bedrooms,
                p.bathrooms,
                p.area,
                p.status,
                p.created_at
            FROM favorites f
            JOIN properties p
                ON f.property_id = p.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `, [user_id]);

        res.json({
            success: true,
            count: favorites.length,
            favorites
        });

    } catch (error) {
        console.error("Get favorites error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch favorites"
        });
    }
};


// ========================================
// REMOVE PROPERTY FROM FAVORITES
// ========================================
const removeFavorite = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { property_id } = req.params;

        const [result] = await db.query(
            `DELETE FROM favorites
             WHERE user_id = ?
             AND property_id = ?`,
            [user_id, property_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Property is not in your favorites"
            });
        }

        res.json({
            success: true,
            message: "Property removed from favorites"
        });

    } catch (error) {
        console.error("Remove favorite error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove property from favorites"
        });
    }
};


module.exports = {
    addFavorite,
    getMyFavorites,
    removeFavorite
};