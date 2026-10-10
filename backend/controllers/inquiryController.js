const db = require("../config/db");

// ========================================
// CONTACT PROPERTY OWNER
// ========================================
const createInquiry = async (req, res) => {
    try {
        const user_id = req.user.id;

        const {
            property_id,
            message,
            contact_phone
        } = req.body;

        // ========================================
        // VALIDATE INPUT
        // ========================================

        if (!property_id) {
            return res.status(400).json({
                success: false,
                message: "Property ID is required"
            });
        }

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        // ========================================
        // VALIDATE PROPERTY ID
        // ========================================

        const propertyId = Number(property_id);

        if (
            !Number.isInteger(propertyId) ||
            propertyId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid property ID"
            });
        }

        // ========================================
        // CHECK PROPERTY AND OWNER
        // ========================================

        const [properties] = await db.query(
            `
            SELECT
                p.id,
                p.owner_id,
                p.title,
                p.status,
                u.phone AS owner_phone
            FROM properties p
            JOIN users u
                ON p.owner_id = u.id
            WHERE p.id = ?
            `,
            [propertyId]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        const property = properties[0];

        // ========================================
        // ONLY APPROVED PROPERTIES
        // ========================================

        if (property.status !== "approved") {
            return res.status(400).json({
                success: false,
                message:
                    "You can only contact the owner of an approved property"
            });
        }

        // ========================================
        // PREVENT OWNER CONTACTING THEMSELVES
        // ========================================

        if (
            Number(property.owner_id) ===
            Number(user_id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot contact yourself about your own property"
            });
        }

        // ========================================
        // GET CONTACT PHONE
        // ========================================

        let phone = null;

        if (
            contact_phone &&
            typeof contact_phone === "string" &&
            contact_phone.trim()
        ) {
            phone = contact_phone.trim();
        } else {
            const [users] = await db.query(
                `
                SELECT phone
                FROM users
                WHERE id = ?
                `,
                [user_id]
            );

            if (users.length > 0) {
                phone = users[0].phone || null;
            }
        }

        // ========================================
        // CREATE INQUIRY
        // ========================================

        const [result] = await db.query(
            `
            INSERT INTO inquiries (
                user_id,
                property_id,
                message,
                contact_phone
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                user_id,
                propertyId,
                message.trim(),
                phone
            ]
        );

        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        res.status(201).json({
            success: true,
            message: "Inquiry sent successfully",
            inquiryId: result.insertId
        });

    } catch (error) {
        console.error(
            "Create inquiry error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to send inquiry"
        });
    }
};


// ========================================
// GET MY SENT INQUIRIES
// ========================================
const getMyInquiries = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [inquiries] = await db.query(
            `
            SELECT
                i.id,
                i.message,
                i.contact_phone,
                i.created_at,

                p.id AS property_id,
                p.title AS property_title,
                p.location,

                u.name AS owner_name,
                u.email AS owner_email,
                u.phone AS owner_phone

            FROM inquiries i

            JOIN properties p
                ON i.property_id = p.id

            JOIN users u
                ON p.owner_id = u.id

            WHERE i.user_id = ?

            ORDER BY i.created_at DESC
            `,
            [user_id]
        );

        res.json({
            success: true,
            count: inquiries.length,
            inquiries
        });

    } catch (error) {
        console.error(
            "Get my inquiries error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch your inquiries"
        });
    }
};


// ========================================
// GET INQUIRIES RECEIVED BY PROPERTY OWNER
// ========================================
const getOwnerInquiries = async (req, res) => {
    try {
        const owner_id = req.user.id;

        const [inquiries] = await db.query(
            `
            SELECT
                i.id,
                i.message,
                i.contact_phone,
                i.created_at,

                p.id AS property_id,
                p.title AS property_title,
                p.location,

                u.id AS user_id,
                u.name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone

            FROM inquiries i

            JOIN properties p
                ON i.property_id = p.id

            JOIN users u
                ON i.user_id = u.id

            WHERE p.owner_id = ?

            ORDER BY i.created_at DESC
            `,
            [owner_id]
        );

        res.json({
            success: true,
            count: inquiries.length,
            inquiries
        });

    } catch (error) {
        console.error(
            "Get owner inquiries error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch received inquiries"
        });
    }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
    createInquiry,
    getMyInquiries,
    getOwnerInquiries
};