const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// Serve uploaded property images
app.use("/uploads", express.static("uploads"));

// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/properties", propertyRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/inquiries", inquiryRoutes);

app.use("/api/admin", adminRoutes);

// ==============================
// HOME ROUTE
// ==============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Real Estate Portal Backend is running!"
    });
});

// ==============================
// DATABASE TEST
// ==============================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS test");

        res.json({
            success: true,
            message: "Database is connected successfully!",
            data: rows
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// ==============================
// 404 ROUTE
// ==============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});