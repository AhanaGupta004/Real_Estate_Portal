const db = require("../config/db");

// ========================================
// GET ALL PROPERTIES FOR ADMIN
// ========================================
const getAllPropertiesForAdmin = async (req, res) => {
    try {
        const [properties] = await db.query(`
            SELECT
                p.id,
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
                p.created_at,

                u.id AS owner_id,
                u.name AS owner_name,
                u.email AS owner_email,
                u.phone AS owner_phone

            FROM properties p

            JOIN users u
                ON p.owner_id = u.id

            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            count: properties.length,
            properties
        });

    } catch (error) {
        console.error("Admin get properties error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch properties"
        });
    }
};


// ========================================
// GET PENDING PROPERTIES
// ========================================
const getPendingProperties = async (req, res) => {
    try {
        const [properties] = await db.query(`
            SELECT
                p.id,
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
                p.created_at,

                u.id AS owner_id,
                u.name AS owner_name,
                u.email AS owner_email,
                u.phone AS owner_phone

            FROM properties p

            JOIN users u
                ON p.owner_id = u.id

            WHERE p.status = 'pending'

            ORDER BY p.created_at ASC
        `);

        res.json({
            success: true,
            count: properties.length,
            properties
        });

    } catch (error) {
        console.error("Get pending properties error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch pending properties"
        });
    }
};


// ========================================
// GET PROPERTY BY ID FOR ADMIN
// ========================================
const getPropertyByIdForAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const [properties] = await db.query(`
            SELECT
                p.id,
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
                p.created_at,

                u.id AS owner_id,
                u.name AS owner_name,
                u.email AS owner_email,
                u.phone AS owner_phone

            FROM properties p

            JOIN users u
                ON p.owner_id = u.id

            WHERE p.id = ?
        `, [id]);

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        const [images] = await db.query(
            `SELECT id, image_url
             FROM property_images
             WHERE property_id = ?`,
            [id]
        );

        res.json({
            success: true,
            property: {
                ...properties[0],
                images
            }
        });

    } catch (error) {
        console.error("Admin get property error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch property"
        });
    }
};


// ========================================
// APPROVE PROPERTY
// ========================================
const approveProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const [properties] = await db.query(
            `SELECT id, status
             FROM properties
             WHERE id = ?`,
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        await db.query(
            `UPDATE properties
             SET status = 'approved'
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Property approved successfully"
        });

    } catch (error) {
        console.error("Approve property error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to approve property"
        });
    }
};


// ========================================
// REJECT PROPERTY
// ========================================
const rejectProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const [properties] = await db.query(
            `SELECT id, status
             FROM properties
             WHERE id = ?`,
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        await db.query(
            `UPDATE properties
             SET status = 'rejected'
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Property rejected successfully"
        });

    } catch (error) {
        console.error("Reject property error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reject property"
        });
    }
};


// ========================================
// DELETE PROPERTY
// ========================================
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const [properties] = await db.query(
            `SELECT id
             FROM properties
             WHERE id = ?`,
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Delete related records first
        await db.query(
            `DELETE FROM favorites
             WHERE property_id = ?`,
            [id]
        );

        await db.query(
            `DELETE FROM inquiries
             WHERE property_id = ?`,
            [id]
        );

        await db.query(
            `DELETE FROM property_images
             WHERE property_id = ?`,
            [id]
        );

        // Delete property
        await db.query(
            `DELETE FROM properties
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Property deleted successfully"
        });

    } catch (error) {
        console.error("Admin delete property error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete property"
        });
    }
};


// ========================================
// GET ALL USERS
// ========================================
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                role
            FROM users
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Admin get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


// ========================================
// GET ALL INQUIRIES
// ========================================
const getAllInquiries = async (req, res) => {
    try {
        const [inquiries] = await db.query(`
            SELECT
                i.id,
                i.message,
                i.contact_phone,
                i.created_at,

                p.id AS property_id,
                p.title AS property_title,
                p.location,

                sender.id AS sender_id,
                sender.name AS sender_name,
                sender.email AS sender_email,
                sender.phone AS sender_phone,

                owner.id AS owner_id,
                owner.name AS owner_name,
                owner.email AS owner_email,
                owner.phone AS owner_phone

            FROM inquiries i

            JOIN properties p
                ON i.property_id = p.id

            JOIN users sender
                ON i.user_id = sender.id

            JOIN users owner
                ON p.owner_id = owner.id

            ORDER BY i.created_at DESC
        `);

        res.json({
            success: true,
            count: inquiries.length,
            inquiries
        });

    } catch (error) {
        console.error("Admin get inquiries error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries"
        });
    }
};


// ========================================
// ADMIN DASHBOARD STATISTICS
// ========================================
const getDashboardStats = async (req, res) => {
    try {

        // Total users
        const [userCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM users
        `);

        // Total properties
        const [propertyCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM properties
        `);

        // Pending properties
        const [pendingCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM properties
            WHERE status = 'pending'
        `);

        // Approved properties
        const [approvedCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM properties
            WHERE status = 'approved'
        `);

        // Rejected properties
        const [rejectedCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM properties
            WHERE status = 'rejected'
        `);

        // Total favorites
        const [favoriteCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM favorites
        `);

        // Total inquiries
        const [inquiryCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM inquiries
        `);

        res.json({
            success: true,
            statistics: {
                total_users: userCount[0].total,
                total_properties: propertyCount[0].total,
                pending_properties: pendingCount[0].total,
                approved_properties: approvedCount[0].total,
                rejected_properties: rejectedCount[0].total,
                total_favorites: favoriteCount[0].total,
                total_inquiries: inquiryCount[0].total
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};


// ========================================
// EXPORT ALL ADMIN CONTROLLERS
// ========================================
module.exports = {
    getAllPropertiesForAdmin,
    getPendingProperties,
    getPropertyByIdForAdmin,
    approveProperty,
    rejectProperty,
    deleteProperty,
    getAllUsers,
    getAllInquiries,
    getDashboardStats
};
