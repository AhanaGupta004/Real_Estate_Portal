const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "You have accessed a protected route!",
        user: req.user
    });
});

module.exports = router;