const express = require("express");

const {
    getAllProperties,
    getPropertyById,
    getMyProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    deletePropertyImage
} = require("../controllers/propertyController");

const authenticateToken = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// ========================================
// PUBLIC ROUTES
// ========================================

// Get all approved properties

router.get(
    "/",
    getAllProperties
);


// ========================================
// PROTECTED ROUTES
// ========================================

// IMPORTANT:
// This must come BEFORE /:id
// otherwise "my" can be treated as an ID.


// ========================================
// GET MY PROPERTIES
// ========================================

router.get(
    "/my/properties",
    authenticateToken,
    getMyProperties
);


// ========================================
// CREATE PROPERTY
// ========================================

router.post(
    "/",
    authenticateToken,
    createProperty
);


// ========================================
// UPDATE OWN PROPERTY
// ========================================

router.put(
    "/:id",
    authenticateToken,
    updateProperty
);


// ========================================
// DELETE OWN PROPERTY
// ========================================

router.delete(
    "/:id",
    authenticateToken,
    deleteProperty
);


// ========================================
// PROPERTY IMAGES
// ========================================

// Upload property images

router.post(
    "/:id/images",
    authenticateToken,
    upload.array("images", 5),
    uploadPropertyImages
);


// ========================================
// DELETE ONE PROPERTY IMAGE
// ========================================

// IMPORTANT:
// This must come BEFORE GET /:id
// because it has the /images/:imageId path.

router.delete(
    "/:id/images/:imageId",
    authenticateToken,
    deletePropertyImage
);


// ========================================
// GET PROPERTY BY ID
// ========================================

// Keep this AFTER /my/properties
// and image routes.

router.get(
    "/:id",
    getPropertyById
);


module.exports = router;