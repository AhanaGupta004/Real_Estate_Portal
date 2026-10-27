import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function PropertyDetails() {
    const { id } = useParams();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Photos
    const [selectedImage, setSelectedImage] = useState(0);

    // Favorites
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [favoriteMessage, setFavoriteMessage] = useState("");

    // Inquiry
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    const [inquiryMessage, setInquiryMessage] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [inquiryLoading, setInquiryLoading] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState("");
    const [inquiryError, setInquiryError] = useState("");

    // ========================================
    // FETCH PROPERTY
    // ========================================

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/properties/${id}`
                );

                const data = response.data;

                if (!data.success) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch property"
                    );
                }

                setProperty(data.property);
                setSelectedImage(0);

            } catch (err) {
                console.error(
                    "Property details error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load property"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    // ========================================
    // IMAGE URL
    // ========================================

    const getImageUrl = (image) => {
        if (!image) {
            return "";
        }

        const imagePath =
            image.image_url ||
            image.url ||
            image;

        if (imagePath.startsWith("http")) {
            return imagePath;
        }

        return `http://localhost:5000${imagePath}`;
    };

    // ========================================
    // ADD FAVORITE
    // ========================================

    const addFavorite = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert(
                "Please login to add properties to favorites."
            );

            return;
        }

        try {
            setFavoriteLoading(true);
            setFavoriteMessage("");

            const response = await api.post(
                "/favorites",
                {
                    property_id: Number(id)
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to add favorite"
                );
            }

            setFavoriteMessage(
                "Property added to your favorites ❤️"
            );

        } catch (err) {
            console.error(
                "Add favorite error:",
                err
            );

            setFavoriteMessage(
                err.response?.data?.message ||
                "Failed to add favorite."
            );

        } finally {
            setFavoriteLoading(false);
        }
    };

    // ========================================
    // OPEN INQUIRY FORM
    // ========================================

    const openInquiryForm = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert(
                "Please login to contact the property owner."
            );

            return;
        }

        setInquiryError("");
        setInquirySuccess("");
        setShowInquiryForm(true);
    };

    // ========================================
    // CLOSE INQUIRY FORM
    // ========================================

    const closeInquiryForm = () => {
        setShowInquiryForm(false);
        setInquiryMessage("");
        setContactPhone("");
        setInquiryError("");
        setInquirySuccess("");
    };

    // ========================================
    // SEND INQUIRY
    // ========================================

    const sendInquiry = async (e) => {
        e.preventDefault();

        setInquiryError("");
        setInquirySuccess("");

        if (!inquiryMessage.trim()) {
            setInquiryError(
                "Please enter a message."
            );

            return;
        }

        try {
            setInquiryLoading(true);

            const response = await api.post(
                "/inquiries",
                {
                    property_id: Number(id),
                    message: inquiryMessage.trim(),
                    contact_phone:
                        contactPhone.trim() || null
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to send inquiry"
                );
            }

            setInquirySuccess(
                "Your inquiry has been sent successfully! ✅"
            );

            setInquiryMessage("");
            setContactPhone("");

        } catch (err) {
            console.error(
                "Send inquiry error:",
                err
            );

            setInquiryError(
                err.response?.data?.message ||
                err.message ||
                "Failed to send inquiry."
            );

        } finally {
            setInquiryLoading(false);
        }
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading property...</p>
            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="page-container">

                <h2>
                    Unable to load property
                </h2>

                <p>{error}</p>

                <Link to="/properties">
                    ← Back to Properties
                </Link>

            </div>
        );
    }

    // ========================================
    // PROPERTY NOT FOUND
    // ========================================

    if (!property) {
        return (
            <div className="page-container">

                <h2>
                    Property not found
                </h2>

                <Link to="/properties">
                    ← Back to Properties
                </Link>

            </div>
        );
    }

    const images = property.images || [];

    // ========================================
    // MAIN PAGE
    // ========================================

    return (
        <div className="property-details-page">

            <div className="property-details-container">

                {/* BACK */}

                <Link
                    to="/properties"
                    className="back-link"
                >
                    ← Back to Properties
                </Link>


                {/* ========================================
                    PHOTO GALLERY
                ======================================== */}

                <div className="property-gallery">

                    {images.length > 0 ? (

                        <>

                            {/* MAIN IMAGE */}

                            <div className="main-property-image">

                                <img
                                    src={getImageUrl(
                                        images[selectedImage]
                                    )}
                                    alt={
                                        property.title
                                    }
                                />

                            </div>


                            {/* THUMBNAILS */}

                            {images.length > 1 && (

                                <div className="property-thumbnails">

                                    {images.map(
                                        (
                                            image,
                                            index
                                        ) => (

                                            <button
                                                type="button"
                                                key={
                                                    image.id ||
                                                    image.image_url ||
                                                    index
                                                }
                                                className={
                                                    `property-thumbnail ${
                                                        selectedImage ===
                                                        index
                                                            ? "active"
                                                            : ""
                                                    }`
                                                }
                                                onClick={() =>
                                                    setSelectedImage(
                                                        index
                                                    )
                                                }
                                            >

                                                <img
                                                    src={getImageUrl(
                                                        image
                                                    )}
                                                    alt={`Property ${
                                                        index + 1
                                                    }`}
                                                />

                                            </button>

                                        )
                                    )}

                                </div>
                            )}

                        </>

                    ) : (

                        <div className="no-property-image">

                            <div>
                                🏠
                            </div>

                            <p>
                                No photos available
                            </p>

                        </div>

                    )}

                </div>


                {/* ========================================
                    PROPERTY CARD
                ======================================== */}

                <div className="property-details-card">

                    <div className="property-details-content">

                        {/* HEADER */}

                        <div className="property-details-header">

                            <span className="property-type">
                                {property.property_type}
                            </span>

                            <span className="listing-type">
                                For {property.listing_type}
                            </span>

                        </div>


                        {/* TITLE */}

                        <h1>
                            {property.title}
                        </h1>


                        {/* LOCATION */}

                        <p className="property-location">
                            📍 {property.location}
                        </p>


                        {/* PRICE */}

                        <div className="property-price">

                            ₹
                            {Number(
                                property.price
                            ).toLocaleString(
                                "en-IN"
                            )}

                            {property.listing_type ===
                                "Rent" && (
                                <span className="rent-label">
                                    {" "} / month
                                </span>
                            )}

                        </div>


                        {/* DESCRIPTION */}

                        <p className="property-description">
                            {property.description ||
                                "No description available."}
                        </p>


                        {/* FEATURES */}

                        <div className="property-features">

                            <div>

                                <strong>
                                    {property.bedrooms}
                                </strong>

                                <span>
                                    Bedrooms
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {property.bathrooms}
                                </strong>

                                <span>
                                    Bathrooms
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {property.area ||
                                        "N/A"}
                                </strong>

                                <span>
                                    sq ft
                                </span>

                            </div>

                        </div>


                        {/* OWNER */}

                        <div className="owner-section">

                            <h2>
                                Property Owner
                            </h2>

                            <p>
                                <strong>
                                    Name:
                                </strong>{" "}
                                {property.owner_name}
                            </p>

                            <p>
                                <strong>
                                    Email:
                                </strong>{" "}
                                {property.owner_email}
                            </p>

                            <p>
                                <strong>
                                    Phone:
                                </strong>{" "}
                                {property.owner_phone ||
                                    "Not provided"}
                            </p>

                        </div>


                        {/* ACTIONS */}

                        <div className="property-actions">

                            <button
                                className="primary-btn"
                                onClick={
                                    addFavorite
                                }
                                disabled={
                                    favoriteLoading
                                }
                            >
                                {favoriteLoading
                                    ? "Adding..."
                                    : "❤️ Add to Favorites"}
                            </button>


                            <button
                                className="secondary-btn"
                                onClick={
                                    openInquiryForm
                                }
                            >
                                Contact Owner
                            </button>

                        </div>


                        {/* FAVORITE MESSAGE */}

                        {favoriteMessage && (
                            <p className="favorite-message">
                                {favoriteMessage}
                            </p>
                        )}


                        {/* ========================================
                            INQUIRY FORM
                        ======================================== */}

                        {showInquiryForm && (

                            <div className="inquiry-form-container">

                                <div className="inquiry-form-header">

                                    <h2>
                                        Contact Owner
                                    </h2>

                                    <button
                                        type="button"
                                        className="close-inquiry-btn"
                                        onClick={
                                            closeInquiryForm
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                <p>
                                    Send a message to{" "}
                                    <strong>
                                        {property.owner_name}
                                    </strong>{" "}
                                    about this property.
                                </p>


                                {inquiryError && (
                                    <div className="auth-error">
                                        {inquiryError}
                                    </div>
                                )}


                                {inquirySuccess && (
                                    <div className="auth-success">
                                        {inquirySuccess}
                                    </div>
                                )}


                                <form
                                    onSubmit={
                                        sendInquiry
                                    }
                                >

                                    <div className="form-group">

                                        <label>
                                            Message
                                        </label>

                                        <textarea
                                            value={
                                                inquiryMessage
                                            }
                                            onChange={(e) =>
                                                setInquiryMessage(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="I'm interested in this property. Please provide more details..."
                                            rows="5"
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Contact Phone
                                            <span className="optional-text">
                                                {" "}
                                                (Optional)
                                            </span>
                                        </label>

                                        <input
                                            type="tel"
                                            value={
                                                contactPhone
                                            }
                                            onChange={(e) =>
                                                setContactPhone(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Your phone number"
                                        />

                                    </div>


                                    <button
                                        type="submit"
                                        className="auth-btn"
                                        disabled={
                                            inquiryLoading
                                        }
                                    >
                                        {inquiryLoading
                                            ? "Sending..."
                                            : "Send Inquiry"}
                                    </button>

                                </form>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default PropertyDetails;