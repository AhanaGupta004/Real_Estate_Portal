import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Favorites() {
    const navigate = useNavigate();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    // ========================================
    // FETCH FAVORITES
    // ========================================

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await api.get("/favorites");

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to load favorites"
                );
            }

            setFavorites(
                response.data.favorites || []
            );

        } catch (err) {
            console.error(
                "Favorites error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load favorites."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // LOAD FAVORITES
    // ========================================

    useEffect(() => {
        fetchFavorites();
    }, []);

    // ========================================
    // REMOVE FAVORITE
    // ========================================

    const removeFavorite = async (propertyId) => {
        try {
            setRemovingId(propertyId);

            await api.delete(
                `/favorites/${propertyId}`
            );

            setFavorites((currentFavorites) =>
                currentFavorites.filter(
                    (favorite) => {
                        const property =
                            favorite.property ||
                            favorite;

                        return (
                            favorite.property_id !==
                            propertyId &&
                            property.id !== propertyId
                        );
                    }
                )
            );

        } catch (err) {
            console.error(
                "Remove favorite error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to remove favorite."
            );

        } finally {
            setRemovingId(null);
        }
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="favorites-page">

                <div className="favorites-container">

                    <div className="favorites-header">
                        <h1>
                            My Favorites ❤️
                        </h1>

                        <p>
                            Properties you've saved
                            for later.
                        </p>
                    </div>

                    <p className="status-message">
                        Loading favorites...
                    </p>

                </div>

            </div>
        );
    }

    // ========================================
    // MAIN PAGE
    // ========================================

    return (
        <div className="favorites-page">

            <div className="favorites-container">

                {/* HEADER */}

                <div className="favorites-header">

                    <h1>
                        My Favorites ❤️
                    </h1>

                    <p>
                        Properties you've saved
                        for later.
                    </p>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {/* EMPTY */}

                {!error &&
                    favorites.length === 0 && (

                        <div className="empty-properties">

                            <div className="empty-icon">
                                ❤️
                            </div>

                            <h2>
                                No favorite properties yet.
                            </h2>

                            <p>
                                Browse properties and save
                                the ones you love.
                            </p>

                            <Link
                                to="/properties"
                                className="primary-btn"
                            >
                                Explore Properties
                            </Link>

                        </div>
                    )}

                {/* FAVORITES */}

                {!error &&
                    favorites.length > 0 && (

                        <>
                            <div className="results-header">
                                <h2>
                                    {favorites.length}{" "}
                                    {favorites.length === 1
                                        ? "Favorite"
                                        : "Favorites"}
                                </h2>
                            </div>

                            <div className="property-grid">

                                {favorites.map(
                                    (favorite) => {

                                        const property =
                                            favorite.property ||
                                            favorite;

                                        const propertyId =
                                            favorite.property_id ||
                                            property.id;

                                        return (
                                            <div
                                                className="property-card"
                                                key={
                                                    propertyId
                                                }
                                            >

                                                {/* IMAGE */}

                                                <div className="property-image">
                                                    🏠
                                                </div>

                                                {/* CONTENT */}

                                                <div className="property-content">

                                                    <span className="property-type">
                                                        {
                                                            property.property_type
                                                        }
                                                    </span>

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
                                                        {Number(
                                                            property.price
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                        {property.listing_type ===
                                                            "Rent" &&
                                                            " / month"}
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
                                                                property.area ||
                                                                "N/A"
                                                            }{" "}
                                                            sq.ft
                                                        </span>

                                                    </div>

                                                    {/* ACTIONS */}

                                                    <div className="favorite-actions">

                                                        <Link
                                                            to={`/properties/${propertyId}`}
                                                            className="view-btn"
                                                        >
                                                            View Details
                                                        </Link>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                removeFavorite(
                                                                    propertyId
                                                                )
                                                            }
                                                            disabled={
                                                                removingId ===
                                                                propertyId
                                                            }
                                                        >
                                                            {removingId ===
                                                            propertyId
                                                                ? "Removing..."
                                                                : "Remove"}
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        </>
                    )}

            </div>

        </div>
    );
}

export default Favorites;