const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ========================================
// GET ALL APPROVED PROPERTIES
// WITH SEARCH & FILTERS
// ========================================

const getAllProperties = async (req, res) => {
    try {
        const {
            search,
            location,
            property_type,
            listing_type,
            min_price,
            max_price,
            bedrooms
        } = req.query;

        let query = `
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
                u.name AS owner_name,
                u.phone AS owner_phone,

                (
                    SELECT pi.image_url
                    FROM property_images pi
                    WHERE pi.property_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS image_url

            FROM properties p
            JOIN users u
                ON p.owner_id = u.id

            WHERE LOWER(p.status) = 'approved'
        `;

        const values = [];

        // ========================================
        // SEARCH
        // ========================================

        if (search && search.trim()) {
            query += `
                AND (
                    LOWER(p.title) LIKE LOWER(?)
                    OR LOWER(p.description) LIKE LOWER(?)
                    OR LOWER(p.location) LIKE LOWER(?)
                )
            `;

            const searchValue = `%${search.trim()}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        // ========================================
        // LOCATION FILTER
        // ========================================

        if (location && location.trim()) {
            query += `
                AND LOWER(p.location) LIKE LOWER(?)
            `;

            values.push(
                `%${location.trim()}%`
            );
        }

        // ========================================
        // PROPERTY TYPE FILTER
        // ========================================

        if (
            property_type &&
            property_type.trim()
        ) {
            query += `
                AND LOWER(p.property_type) = LOWER(?)
            `;

            values.push(
                property_type.trim()
            );
        }

        // ========================================
        // LISTING TYPE FILTER
        // ========================================

        if (
            listing_type &&
            listing_type.trim()
        ) {
            query += `
                AND LOWER(p.listing_type) = LOWER(?)
            `;

            values.push(
                listing_type.trim()
            );
        }

        // ========================================
        // MINIMUM PRICE
        // ========================================

        if (
            min_price !== undefined &&
            min_price !== ""
        ) {
            const minimumPrice =
                Number(min_price);

            if (!isNaN(minimumPrice)) {
                query += `
                    AND p.price >= ?
                `;

                values.push(
                    minimumPrice
                );
            }
        }

        // ========================================
        // MAXIMUM PRICE
        // ========================================

        if (
            max_price !== undefined &&
            max_price !== ""
        ) {
            const maximumPrice =
                Number(max_price);

            if (!isNaN(maximumPrice)) {
                query += `
                    AND p.price <= ?
                `;

                values.push(
                    maximumPrice
                );
            }
        }

        // ========================================
        // BEDROOMS
        // ========================================

        if (
            bedrooms !== undefined &&
            bedrooms !== ""
        ) {
            const minimumBedrooms =
                Number(bedrooms);

            if (!isNaN(minimumBedrooms)) {
                query += `
                    AND p.bedrooms >= ?
                `;

                values.push(
                    minimumBedrooms
                );
            }
        }

        // ========================================
        // SORT
        // ========================================

        query += `
            ORDER BY p.created_at DESC
        `;

        // ========================================
        // DEBUGGING
        // ========================================

        console.log(
            "========================================"
        );

        console.log(
            "PROPERTY FILTER REQUEST"
        );

        console.log(
            "Query:",
            query
        );

        console.log(
            "Values:",
            values
        );

        console.log(
            "========================================"
        );

        // ========================================
        // EXECUTE QUERY
        // ========================================

        const [properties] =
            await db.query(
                query,
                values
            );

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,
            count: properties.length,

            filters: {
                search:
                    search || null,

                location:
                    location || null,

                property_type:
                    property_type || null,

                listing_type:
                    listing_type || null,

                min_price:
                    min_price || null,

                max_price:
                    max_price || null,

                bedrooms:
                    bedrooms || null
            },

            properties
        });

    } catch (error) {

        console.error(
            "Get properties error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch properties",
            error:
                error.message
        });
    }
};


// ========================================
// GET PROPERTY BY ID
// ========================================

const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        // ========================================
        // GET PROPERTY
        // ========================================

        const [properties] =
            await db.query(
                `
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
                    u.name AS owner_name,
                    u.email AS owner_email,
                    u.phone AS owner_phone

                FROM properties p

                JOIN users u
                    ON p.owner_id = u.id

                WHERE p.id = ?
                `,
                [id]
            );

        // ========================================
        // PROPERTY NOT FOUND
        // ========================================

        if (
            properties.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found"
            });
        }

        // ========================================
        // GET ALL PROPERTY IMAGES
        // ========================================

        const [images] =
            await db.query(
                `
                SELECT
                    id,
                    image_url

                FROM property_images

                WHERE property_id = ?

                ORDER BY id ASC
                `,
                [id]
            );

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,

            property: {
                ...properties[0],
                images
            }
        });

    } catch (error) {

        console.error(
            "Get property error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch property"
        });
    }
};


// ========================================
// CREATE PROPERTY
// ========================================

const createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            property_type,
            listing_type,
            price,
            location,
            bedrooms,
            bathrooms,
            area
        } = req.body;

        // ========================================
        // VALIDATE REQUIRED FIELDS
        // ========================================

        if (
            !title ||
            !property_type ||
            !listing_type ||
            !price ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, property type, listing type, price and location are required"
            });
        }

        // ========================================
        // VALIDATE PROPERTY TYPE
        // ========================================

        const allowedPropertyTypes = [
            "Apartment",
            "House",
            "Villa",
            "Plot",
            "Commercial"
        ];

        if (
            !allowedPropertyTypes.includes(
                property_type
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid property type"
            });
        }

        // ========================================
        // VALIDATE LISTING TYPE
        // ========================================

        const allowedListingTypes = [
            "Sale",
            "Rent"
        ];

        if (
            !allowedListingTypes.includes(
                listing_type
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid listing type"
            });
        }

        // ========================================
        // VALIDATE PRICE
        // ========================================

        if (
            isNaN(price) ||
            Number(price) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Price must be greater than 0"
            });
        }

        // ========================================
        // INSERT PROPERTY
        // ========================================

        const [result] =
            await db.query(
                `
                INSERT INTO properties (
                    owner_id,
                    title,
                    description,
                    property_type,
                    listing_type,
                    price,
                    location,
                    bedrooms,
                    bathrooms,
                    area,
                    status
                )

                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'pending'
                )
                `,
                [
                    req.user.id,
                    title,
                    description || null,
                    property_type,
                    listing_type,
                    price,
                    location,
                    bedrooms || 0,
                    bathrooms || 0,
                    area || null
                ]
            );

        // ========================================
        // RESPONSE
        // ========================================

        res.status(201).json({
            success: true,
            message:
                "Property submitted successfully",
            propertyId:
                result.insertId
        });

    } catch (error) {

        console.error(
            "Create property error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create property",
            error:
                error.message
        });
    }
};


// ========================================
// GET MY PROPERTIES
// ========================================

const getMyProperties = async (req, res) => {
    try {

        const [properties] =
            await db.query(
                `
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

                    (
                        SELECT pi.image_url
                        FROM property_images pi
                        WHERE pi.property_id = p.id
                        ORDER BY pi.id ASC
                        LIMIT 1
                    ) AS image_url

                FROM properties p

                WHERE p.owner_id = ?

                ORDER BY p.created_at DESC
                `,
                [req.user.id]
            );

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,
            count: properties.length,
            properties
        });

    } catch (error) {

        console.error(
            "Get my properties error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch your properties"
        });
    }
};


// ========================================
// UPDATE PROPERTY
// ========================================

const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            property_type,
            listing_type,
            price,
            location,
            bedrooms,
            bathrooms,
            area
        } = req.body;

        // ========================================
        // CHECK PROPERTY
        // ========================================

        const [properties] =
            await db.query(
                `
                SELECT
                    id,
                    owner_id

                FROM properties

                WHERE id = ?
                `,
                [id]
            );

        if (
            properties.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found"
            });
        }

        // ========================================
        // ONLY OWNER CAN UPDATE
        // ========================================

        if (
            Number(
                properties[0].owner_id
            ) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only update your own properties"
            });
        }

        // ========================================
        // REQUIRED FIELDS
        // ========================================

        if (
            !title ||
            !property_type ||
            !listing_type ||
            !price ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, property type, listing type, price and location are required"
            });
        }

        // ========================================
        // VALIDATE PROPERTY TYPE
        // ========================================

        const allowedPropertyTypes = [
            "Apartment",
            "House",
            "Villa",
            "Plot",
            "Commercial"
        ];

        if (
            !allowedPropertyTypes.includes(
                property_type
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid property type"
            });
        }

        // ========================================
        // VALIDATE LISTING TYPE
        // ========================================

        const allowedListingTypes = [
            "Sale",
            "Rent"
        ];

        if (
            !allowedListingTypes.includes(
                listing_type
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid listing type"
            });
        }

        // ========================================
        // VALIDATE PRICE
        // ========================================

        if (
            isNaN(price) ||
            Number(price) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Price must be greater than 0"
            });
        }

        // ========================================
        // UPDATE PROPERTY
        // ========================================

        await db.query(
            `
            UPDATE properties

            SET
                title = ?,
                description = ?,
                property_type = ?,
                listing_type = ?,
                price = ?,
                location = ?,
                bedrooms = ?,
                bathrooms = ?,
                area = ?,

                status = 'pending'

            WHERE id = ?
            `,
            [
                title,
                description || null,
                property_type,
                listing_type,
                price,
                location,
                bedrooms || 0,
                bathrooms || 0,
                area || null,
                id
            ]
        );

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,
            message:
                "Property updated successfully and sent for re-approval"
        });

    } catch (error) {

        console.error(
            "Update property error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update property"
        });
    }
};


// ========================================
// DELETE PROPERTY
// ========================================

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // ========================================
        // CHECK PROPERTY
        // ========================================

        const [properties] =
            await db.query(
                `
                SELECT
                    id,
                    owner_id

                FROM properties

                WHERE id = ?
                `,
                [id]
            );

        if (
            properties.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found"
            });
        }

        // ========================================
        // ONLY OWNER CAN DELETE
        // ========================================

        if (
            Number(
                properties[0].owner_id
            ) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete your own properties"
            });
        }

        // ========================================
        // GET IMAGE FILES
        // ========================================

        const [images] =
            await db.query(
                `
                SELECT
                    image_url

                FROM property_images

                WHERE property_id = ?
                `,
                [id]
            );

        // ========================================
        // DELETE IMAGE FILES
        // ========================================

        for (
            const image of images
        ) {

            if (!image.image_url) {
                continue;
            }

            const filePath =
                path.join(
                    __dirname,
                    "..",
                    image.image_url.replace(
                        /^\/+/,
                        ""
                    )
                );

            if (
                fs.existsSync(
                    filePath
                )
            ) {

                try {

                    fs.unlinkSync(
                        filePath
                    );

                } catch (
                    fileError
                ) {

                    console.error(
                        "Failed to delete image file:",
                        fileError
                    );
                }
            }
        }

        // ========================================
        // DELETE IMAGE DATABASE RECORDS
        // ========================================

        await db.query(
            `
            DELETE FROM property_images

            WHERE property_id = ?
            `,
            [id]
        );

        // ========================================
        // DELETE PROPERTY
        // ========================================

        await db.query(
            `
            DELETE FROM properties

            WHERE id = ?
            `,
            [id]
        );

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,
            message:
                "Property deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete property error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete property"
        });
    }
};


// ========================================
// UPLOAD PROPERTY IMAGES
// ========================================

const uploadPropertyImages = async (req, res) => {
    try {
        const { id } = req.params;

        // ========================================
        // CHECK PROPERTY
        // ========================================

        const [properties] =
            await db.query(
                `
                SELECT
                    id,
                    owner_id

                FROM properties

                WHERE id = ?
                `,
                [id]
            );

        if (
            properties.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found"
            });
        }

        // ========================================
        // ONLY OWNER CAN UPLOAD
        // ========================================

        if (
            Number(
                properties[0].owner_id
            ) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only upload images for your own properties"
            });
        }

        // ========================================
        // CURRENT IMAGE COUNT
        // ========================================

        const [currentImages] =
            await db.query(
                `
                SELECT
                    id

                FROM property_images

                WHERE property_id = ?
                `,
                [id]
            );

        const currentCount =
            currentImages.length;

        const newCount =
            req.files
                ? req.files.length
                : 0;

        // ========================================
        // MAXIMUM 5 IMAGES
        // ========================================

        if (
            currentCount +
            newCount >
            5
        ) {

            // Delete files already uploaded by Multer
            if (req.files) {

                for (
                    const file of req.files
                ) {

                    const filePath =
                        path.join(
                            __dirname,
                            "..",
                            "uploads",
                            file.filename
                        );

                    if (
                        fs.existsSync(
                            filePath
                        )
                    ) {

                        fs.unlinkSync(
                            filePath
                        );
                    }
                }
            }

            return res.status(400).json({
                success: false,
                message:
                    `A property can have a maximum of 5 photos. You already have ${currentCount}.`
            });
        }

        // ========================================
        // CHECK FILES
        // ========================================

        if (
            !req.files ||
            req.files.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload at least one image"
            });
        }

        // ========================================
        // SAVE IMAGES
        // ========================================

        const uploadedImages = [];

        for (
            const file of req.files
        ) {

            const imageUrl =
                `/uploads/${file.filename}`;

            const [result] =
                await db.query(
                    `
                    INSERT INTO property_images
                    (
                        property_id,
                        image_url
                    )

                    VALUES (?, ?)
                    `,
                    [
                        id,
                        imageUrl
                    ]
                );

            uploadedImages.push({
                id:
                    result.insertId,

                filename:
                    file.filename,

                url:
                    imageUrl
            });
        }

        // ========================================
        // RESPONSE
        // ========================================

        res.status(201).json({
            success: true,
            message:
                "Images uploaded successfully",
            images:
                uploadedImages
        });

    } catch (error) {

        console.error(
            "Image upload error:",
            error
        );

        // ========================================
        // CLEAN UP FILES
        // ========================================

        if (req.files) {

            for (
                const file of req.files
            ) {

                const filePath =
                    path.join(
                        __dirname,
                        "..",
                        "uploads",
                        file.filename
                    );

                if (
                    fs.existsSync(
                        filePath
                    )
                ) {

                    try {

                        fs.unlinkSync(
                            filePath
                        );

                    } catch (
                        cleanupError
                    ) {

                        console.error(
                            "Image cleanup error:",
                            cleanupError
                        );
                    }
                }
            }
        }

        res.status(500).json({
            success: false,
            message:
                "Failed to upload images",
            error:
                error.message
        });
    }
};


// ========================================
// DELETE ONE PROPERTY IMAGE
// ========================================

const deletePropertyImage = async (req, res) => {
    try {
        const {
            id,
            imageId
        } = req.params;

        // ========================================
        // CHECK PROPERTY
        // ========================================

        const [properties] =
            await db.query(
                `
                SELECT
                    id,
                    owner_id

                FROM properties

                WHERE id = ?
                `,
                [id]
            );

        if (
            properties.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found"
            });
        }

        // ========================================
        // ONLY OWNER CAN DELETE IMAGE
        // ========================================

        if (
            Number(
                properties[0].owner_id
            ) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete images from your own properties"
            });
        }

        // ========================================
        // GET IMAGE
        // ========================================

        const [images] =
            await db.query(
                `
                SELECT
                    id,
                    image_url

                FROM property_images

                WHERE id = ?

                AND property_id = ?
                `,
                [
                    imageId,
                    id
                ]
            );

        if (
            images.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Property image not found"
            });
        }

        const image =
            images[0];

        // ========================================
        // DELETE DATABASE RECORD
        // ========================================

        await db.query(
            `
            DELETE FROM property_images

            WHERE id = ?

            AND property_id = ?
            `,
            [
                imageId,
                id
            ]
        );

        // ========================================
        // DELETE ACTUAL FILE
        // ========================================

        if (
            image.image_url
        ) {

            const filePath =
                path.join(
                    __dirname,
                    "..",
                    image.image_url.replace(
                        /^\/+/,
                        ""
                    )
                );

            if (
                fs.existsSync(
                    filePath
                )
            ) {

                try {

                    fs.unlinkSync(
                        filePath
                    );

                } catch (
                    fileError
                ) {

                    console.error(
                        "Failed to delete image file:",
                        fileError
                    );
                }
            }
        }

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,
            message:
                "Property image deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete property image error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete property image",
            error:
                error.message
        });
    }
};


// ========================================
// EXPORT ALL CONTROLLERS
// ========================================

module.exports = {
    getAllProperties,
    getPropertyById,
    createProperty,
    getMyProperties,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    deletePropertyImage
};