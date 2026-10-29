import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function MyProperties() {
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // ========================================
    // IMAGE URL
    // ========================================

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return "";
        }

        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        return `http://localhost:5000${imageUrl}`;
    };

    // ========================================
    // FETCH MY PROPERTIES
    // ========================================

    const fetchMyProperties = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await api.get(
                "/properties/my/properties"
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to load properties"
                );
            }

            setProperties(
                response.data.properties || []
            );

        } catch (err) {
            console.error(
                "My properties error:",
                err
            );

            // Token expired / invalid
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load your properties."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // LOAD PROPERTIES
    // ========================================

    useEffect(() => {
        fetchMyProperties();
    }, []);

    // ========================================
    // DELETE PROPERTY
    // ========================================

    const deleteProperty = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this property?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            const response = await api.delete(
                `/properties/${id}`
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to delete property"
                );
            }

            // Remove from UI immediately
            setProperties(
                (currentProperties) =>
                    currentProperties.filter(
                        (property) =>
                            property.id !== id
                    )
            );

        } catch (err) {
            console.error(
                "Delete property error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete property."
            );

        } finally {
            setDeletingId(null);
        }
    };

    // ========================================
    // STATUS LABEL
    // ========================================

    const getStatusLabel = (status) => {
        if (!status) {
            return "Pending";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="my-properties-page">
                <div className="my-properties-container">

                    <div className="my-properties-header">
                        <div>
                            <h1>
                                My Properties
                            </h1>

                            <p>
                                Manage the properties you
                                have listed on EstateHub.
                            </p>
                        </div>
                    </div>

                    <p className="status-message">
                        Loading your properties...
                    </p>

                </div>
            </div>
        );
    }

    // ========================================
    // MAIN PAGE
    // ========================================

    return (
        <div className="my-properties-page">

            <div className="my-properties-container">

                {/* HEADER */}

                <div className="my-properties-header">

                    <div>
                        <h1>
                            My Properties
                        </h1>

                        <p>
                            Manage the properties you
                            have listed on EstateHub.
                        </p>
                    </div>

                    <Link
                        to="/add-property"
                        className="primary-btn"
                    >
                        + Add Property
                    </Link>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {/* EMPTY STATE */}

                {!error &&
                    properties.length === 0 && (

                        <div className="empty-properties">

                            <div className="empty-icon">
                                🏠
                            </div>

                            <h2>
                                You haven't listed any
                                properties yet.
                            </h2>

                            <p>
                                Add your first property and
                                start reaching potential
                                buyers or tenants.
                            </p>

                            <Link
                                to="/add-property"
                                className="primary-btn"
                            >
                                List Your Property
                            </Link>

                        </div>
                    )}

                {/* PROPERTY LIST */}

                {!error &&
                    properties.length > 0 && (

                        <div className="my-property-grid">

                            {properties.map(
                                (property) => (

                                    <div
                                        className="my-property-card"
                                        key={property.id}
                                    >

                                        {/* IMAGE */}

                                        <div className="property-image">

                                            {property.image_url ? (
                                                <img
                                                    src={getImageUrl(
                                                        property.image_url
                                                    )}
                                                    alt={
                                                        property.title
                                                    }
                                                    className="property-card-image"
                                                />
                                            ) : (
                                                <span className="property-image-placeholder">
                                                    🏠
                                                </span>
                                            )}

                                            <div className="sale-badge">
                                                For{" "}
                                                {property.listing_type}
                                            </div>

                                        </div>

                                        {/* CONTENT */}

                                        <div className="my-property-content">

                                            <div className="my-property-top">

                                                <span className="property-type">
                                                    {
                                                        property.property_type
                                                    }
                                                </span>

                                                <span
                                                    className={`status-badge ${
                                                        property.status ||
                                                        "pending"
                                                    }`}
                                                >
                                                    {
                                                        getStatusLabel(
                                                            property.status
                                                        )
                                                    }
                                                </span>

                                            </div>

                                            {/* TITLE */}

                                            <h2>
                                                {
                                                    property.title
                                                }
                                            </h2>

                                            {/* LOCATION */}

                                            <p className="location">
                                                📍{" "}
                                                {
                                                    property.location
                                                }
                                            </p>

                                            {/* PRICE */}

                                            <p className="price">
                                                ₹
                                                {Number(
                                                    property.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                                {property.listing_type ===
                                                    "Rent" &&
                                                    " / month"}
                                            </p>

                                            {/* DETAILS */}

                                            <div className="property-details">

                                                <span>
                                                    🛏️{" "}
                                                    {
                                                        property.bedrooms
                                                    }{" "}
                                                    Beds
                                                </span>

                                                <span>
                                                    🚿{" "}
                                                    {
                                                        property.bathrooms
                                                    }{" "}
                                                    Baths
                                                </span>

                                                <span>
                                                    📐{" "}
                                                    {
                                                        property.area ||
                                                        "N/A"
                                                    }{" "}
                                                    sq.ft
                                                </span>

                                            </div>

                                            {/* STATUS MESSAGE */}

                                            {property.status ===
                                                "pending" && (

                                                <p className="property-status-info">
                                                    ⏳ Waiting for admin
                                                    approval.
                                                </p>
                                            )}

                                            {property.status ===
                                                "rejected" && (

                                                <p className="property-status-info rejected-info">
                                                    ❌ This property was
                                                    rejected. You can edit
                                                    it and submit again.
                                                </p>
                                            )}

                                            {property.status ===
                                                "approved" && (

                                                <p className="property-status-info approved-info">
                                                    ✅ Your property is
                                                    live on EstateHub.
                                                </p>
                                            )}

                                            {/* ACTIONS */}

                                            <div className="my-property-actions">

                                                <Link
                                                    to={`/properties/${property.id}`}
                                                    className="view-btn"
                                                >
                                                    View
                                                </Link>

                                                <Link
                                                    to={`/edit-property/${property.id}`}
                                                    className="edit-btn"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deleteProperty(
                                                            property.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        property.id
                                                    }
                                                >
                                                    {deletingId ===
                                                    property.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

            </div>
        </div>
    );
}

export default MyProperties;