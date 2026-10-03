const express = require("express");

const {
    getAllPropertiesForAdmin,
    getPendingProperties,
    getPropertyByIdForAdmin,
    approveProperty,
    rejectProperty,
    deleteProperty,
    getAllUsers,
    getAllInquiries,
    getDashboardStats
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// ========================================
// ADMIN AUTHENTICATION
// ========================================

// Every admin route requires:
// 1. Valid JWT
// 2. Admin role

router.use(authenticateToken);
router.use(adminOnly);


// ========================================
// DASHBOARD
// ========================================

// Get dashboard statistics
router.get("/stats", getDashboardStats);


// ========================================
// PROPERTY MANAGEMENT
// ========================================

// Get all properties
router.get("/properties", getAllPropertiesForAdmin);

// Get pending properties
router.get("/properties/pending", getPendingProperties);

// Get property by ID
router.get("/properties/:id", getPropertyByIdForAdmin);

// Approve property
router.put("/properties/:id/approve", approveProperty);

// Reject property
router.put("/properties/:id/reject", rejectProperty);

// Delete property
router.delete("/properties/:id", deleteProperty);


// ========================================
// USER MANAGEMENT
// ========================================

// Get all users
router.get("/users", getAllUsers);


// ========================================
// INQUIRY MANAGEMENT
// ========================================

// Get all inquiries
router.get("/inquiries", getAllInquiries);


module.exports = router;
