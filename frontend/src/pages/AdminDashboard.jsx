import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/properties");

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Failed to load properties"
                );
            }

            setProperties(response.data.properties || []);

        } catch (err) {
            console.error("Admin dashboard error:", err);

            if (err.response?.status === 403) {
                setError("Admin access required.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load properties."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const updateStatus = async (id, action) => {
        try {
            const endpoint =
                action === "approve"
                    ? `/admin/properties/${id}/approve`
                    : `/admin/properties/${id}/reject`;

            const response = await api.put(endpoint);

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to update property"
                );
            }

            fetchProperties();

        } catch (err) {
            console.error("Update property error:", err);

            alert(
                err.response?.data?.message ||
                "Failed to update property."
            );
        }
    };

    const deleteProperty = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this property?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await api.delete(
                `/admin/properties/${id}`
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to delete property"
                );
            }

            fetchProperties();

        } catch (err) {
            console.error("Delete property error:", err);

            alert(
                err.response?.data?.message ||
                "Failed to delete property."
            );
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <h2>Admin Dashboard</h2>
                <p>Loading properties...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">

            <div className="admin-container">

                <div className="admin-header">

                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>
                            Manage property listings and approvals.
                        </p>
                    </div>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>

                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {!error && (
                    <>
                        <div className="admin-stats">

                            <div className="stat-card">
                                <strong>
                                    {properties.length}
                                </strong>
                                <span>Total Properties</span>
                            </div>

                            <div className="stat-card">
                                <strong>
                                    {
                                        properties.filter(
                                            (p) =>
                                                p.status === "pending"
                                        ).length
                                    }
                                </strong>
                                <span>Pending</span>
                            </div>

                            <div className="stat-card">
                                <strong>
                                    {
                                        properties.filter(
                                            (p) =>
                                                p.status === "approved"
                                        ).length
                                    }
                                </strong>
                                <span>Approved</span>
                            </div>

                            <div className="stat-card">
                                <strong>
                                    {
                                        properties.filter(
                                            (p) =>
                                                p.status === "rejected"
                                        ).length
                                    }
                                </strong>
                                <span>Rejected</span>
                            </div>

                        </div>

                        <div className="admin-properties">

                            <h2>Property Listings</h2>

                            {properties.length === 0 ? (
                                <p className="status-message">
                                    No properties found.
                                </p>
                            ) : (
                                <div className="admin-table-wrapper">

                                    <table className="admin-table">

                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Property</th>
                                                <th>Owner</th>
                                                <th>Price</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {properties.map(
                                                (property) => (
                                                    <tr
                                                        key={
                                                            property.id
                                                        }
                                                    >

                                                        <td>
                                                            #
                                                            {
                                                                property.id
                                                            }
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    property.title
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    property.property_type
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            {
                                                                property.owner_name
                                                            }

                                                            <small>
                                                                {
                                                                    property.owner_email
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {Number(
                                                                property.price
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                        <td>
                                                            {
                                                                property.location
                                                            }
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-badge ${property.status}`}
                                                            >
                                                                {
                                                                    property.status
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>

                                                            <div className="admin-actions">

                                                                {property.status !==
                                                                    "approved" && (
                                                                    <button
                                                                        className="approve-btn"
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                property.id,
                                                                                "approve"
                                                                            )
                                                                        }
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                )}

                                                                {property.status !==
                                                                    "rejected" && (
                                                                    <button
                                                                        className="reject-btn"
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                property.id,
                                                                                "reject"
                                                                            )
                                                                        }
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                )}

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        deleteProperty(
                                                                            property.id
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>
                    </>
                )}

            </div>

        </div>
    );
}

export default AdminDashboard;