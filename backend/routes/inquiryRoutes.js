const express = require("express");

const {
    createInquiry,
    getMyInquiries,
    getOwnerInquiries
} = require("../controllers/inquiryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// ALL INQUIRY ROUTES REQUIRE LOGIN
// ========================================

router.use(authenticateToken);


// ========================================
// CONTACT PROPERTY OWNER
// POST /api/inquiries
// ========================================

router.post(
    "/",
    createInquiry
);


// ========================================
// GET MY SENT INQUIRIES
// GET /api/inquiries/my
// ========================================

router.get(
    "/my",
    getMyInquiries
);


// ========================================
// GET RECEIVED INQUIRIES
// GET /api/inquiries/received
// ========================================

router.get(
    "/received",
    getOwnerInquiries
);


// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;