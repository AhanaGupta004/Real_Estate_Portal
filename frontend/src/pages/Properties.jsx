import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Properties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        location: "",
        property_type: "",
        listing_type: "",
        min_price: "",
        max_price: "",
        bedrooms: ""
    });

    // ========================================
    // FETCH PROPERTIES
    // ========================================

    const fetchProperties = async (
        currentFilters = filters
    ) => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            Object.entries(currentFilters).forEach(
                ([key, value]) => {
                    if (value !== "") {
                        params[key] = value;
                    }
                }
            );

            const response = await api.get(
                "/properties",
                {
                    params
                }
            );

            setProperties(
                response.data.properties || []
            );

        } catch (err) {
            console.error(
                "Fetch properties error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load properties."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // LOAD PROPERTIES
    // ========================================

    useEffect(() => {
        fetchProperties();
    }, []);

    // ========================================
    // HANDLE FILTER CHANGE
    // ========================================

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setFilters(
            (previousFilters) => ({
                ...previousFilters,
                [name]: value
            })
        );
    };

    // ========================================
    // SEARCH
    // ========================================

    const handleSearch = (e) => {
        e.preventDefault();

        fetchProperties(filters);
    };

    // ========================================
    // CLEAR FILTERS
    // ========================================

    const clearFilters = () => {
        const emptyFilters = {
            location: "",
            property_type: "",
            listing_type: "",
            min_price: "",
            max_price: "",
            bedrooms: ""
        };

        setFilters(emptyFilters);

        fetchProperties(emptyFilters);
    };

    // ========================================
    // FORMAT PRICE
    // ========================================

    const formatPrice = (price) => {
        return Number(price).toLocaleString(
            "en-IN"
        );
    };

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
    // RETURN
    // ========================================

    return (
        <div className="properties-page">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="properties-header">

                <h1>
                    Find Your Perfect Property
                </h1>

                <p>
                    Browse verified properties
                    and find a place that feels
                    like home.
                </p>

            </div>


            {/* ========================================
                FILTERS
            ======================================== */}

            <form
                className="filters"
                onSubmit={handleSearch}
            >

                {/* LOCATION */}

                <input
                    type="text"
                    name="location"
                    placeholder="Search location"
                    value={filters.location}
                    onChange={handleChange}
                />


                {/* PROPERTY TYPE */}

                <select
                    name="property_type"
                    value={
                        filters.property_type
                    }
                    onChange={handleChange}
                >

                    <option value="">
                        Property Type
                    </option>

                    <option value="Apartment">
                        Apartment
                    </option>

                    <option value="House">
                        House
                    </option>

                    <option value="Villa">
                        Villa
                    </option>

                    <option value="Plot">
                        Plot
                    </option>

                    <option value="Commercial">
                        Commercial
                    </option>

                </select>


                {/* LISTING TYPE */}

                <select
                    name="listing_type"
                    value={
                        filters.listing_type
                    }
                    onChange={handleChange}
                >

                    <option value="">
                        Sale / Rent
                    </option>

                    <option value="Sale">
                        Sale
                    </option>

                    <option value="Rent">
                        Rent
                    </option>

                </select>


                {/* MIN PRICE */}

                <input
                    type="number"
                    name="min_price"
                    placeholder="Min price"
                    value={
                        filters.min_price
                    }
                    onChange={handleChange}
                />


                {/* MAX PRICE */}

                <input
                    type="number"
                    name="max_price"
                    placeholder="Max price"
                    value={
                        filters.max_price
                    }
                    onChange={handleChange}
                />


                {/* BEDROOMS */}

                <select
                    name="bedrooms"
                    value={
                        filters.bedrooms
                    }
                    onChange={handleChange}
                >

                    <option value="">
                        Bedrooms
                    </option>

                    <option value="1">
                        1+
                    </option>

                    <option value="2">
                        2+
                    </option>

                    <option value="3">
                        3+
                    </option>

                    <option value="4">
                        4+
                    </option>

                    <option value="5">
                        5+
                    </option>

                </select>


                {/* SEARCH */}

                <button type="submit">
                    🔎 Search
                </button>


                {/* CLEAR */}

                <button
                    type="button"
                    className="clear-btn"
                    onClick={clearFilters}
                >
                    Clear
                </button>

            </form>


            {/* ========================================
                RESULTS HEADER
            ======================================== */}

            <div className="results-header">

                <h2>
                    {loading
                        ? "Finding Properties..."
                        : `${properties.length} Properties Found`
                    }
                </h2>

            </div>


            {/* ========================================
                LOADING
            ======================================== */}

            {loading && (
                <div className="status-message">

                    <p>
                        Loading properties...
                    </p>

                </div>
            )}


            {/* ========================================
                ERROR
            ======================================== */}

            {!loading && error && (

                <div className="error-message">

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            fetchProperties()
                        }
                    >
                        Try Again
                    </button>

                </div>
            )}


            {/* ========================================
                NO PROPERTIES
            ======================================== */}

            {!loading &&
                !error &&
                properties.length === 0 && (

                    <div className="empty-properties">

                        <div className="empty-icon">
                            🏠
                        </div>

                        <h2>
                            No Properties Found
                        </h2>

                        <p>
                            Try changing your
                            filters or search
                            for another location.
                        </p>

                        <button
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    </div>
                )
            }


            {/* ========================================
                PROPERTY GRID
            ======================================== */}

            {!loading &&
                !error &&
                properties.length > 0 && (

                    <div className="property-grid">

                        {properties.map(
                            (property) => (

                                <div
                                    className="property-card"
                                    key={
                                        property.id
                                    }
                                >

                                    {/* ========================================
                                        PROPERTY IMAGE
                                    ======================================== */}

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
                                            {
                                                property.listing_type
                                            }
                                        </div>

                                    </div>


                                    {/* ========================================
                                        PROPERTY CONTENT
                                    ======================================== */}

                                    <div className="property-content">

                                        <div className="property-top">

                                            <span className="property-type">
                                                {
                                                    property.property_type
                                                }
                                            </span>

                                        </div>


                                        <h3>
                                            {
                                                property.title
                                            }
                                        </h3>


                                        <p className="location">
                                            📍{" "}
                                            {
                                                property.location
                                            }
                                        </p>


                                        <p className="price">

                                            ₹
                                            {formatPrice(
                                                property.price
                                            )}

                                            {property.listing_type ===
                                                "Rent" && (

                                                <small>
                                                    {" "}
                                                    / month
                                                </small>

                                            )}

                                        </p>


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
                                                    property.area
                                                }{" "}
                                                sq.ft
                                            </span>

                                        </div>


                                        <Link
                                            to={`/properties/${property.id}`}
                                            className="view-btn"
                                        >
                                            View Details →
                                        </Link>

                                    </div>

                                </div>

                            )
                        )}

                    </div>
                )
            }

        </div>
    );
}

export default Properties;