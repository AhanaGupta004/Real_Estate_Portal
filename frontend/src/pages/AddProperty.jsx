import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function AddProperty() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        property_type: "Apartment",
        listing_type: "Sale",
        price: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        area: ""
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ========================================
    // CHECK LOGIN
    // ========================================

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    // ========================================
    // HANDLE INPUT
    // ========================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
        setSuccess("");
    };

    // ========================================
    // HANDLE IMAGE SELECTION
    // ========================================

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        setError("");

        if (files.length === 0) {
            return;
        }

        // Maximum 5 images
        if (files.length > 5) {
            setError(
                "You can upload a maximum of 5 photos."
            );

            e.target.value = "";
            return;
        }

        // Check file size
        const oversizedFile = files.find(
            (file) =>
                file.size > 5 * 1024 * 1024
        );

        if (oversizedFile) {
            setError(
                "Each photo must be smaller than 5 MB."
            );

            e.target.value = "";
            return;
        }

        // Check file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        const invalidFile = files.find(
            (file) =>
                !allowedTypes.includes(
                    file.type
                )
        );

        if (invalidFile) {
            setError(
                "Only JPG, JPEG, PNG and WEBP photos are allowed."
            );

            e.target.value = "";
            return;
        }

        setSelectedImages(files);
    };

    // ========================================
    // REMOVE SELECTED IMAGE
    // ========================================

    const removeImage = (index) => {
        setSelectedImages(
            (currentImages) =>
                currentImages.filter(
                    (_, imageIndex) =>
                        imageIndex !== index
                )
        );
    };

    // ========================================
    // SUBMIT PROPERTY
    // ========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // ========================================
        // VALIDATION
        // ========================================

        if (!formData.title.trim()) {
            setError(
                "Please enter a property title."
            );
            return;
        }

        if (!formData.location.trim()) {
            setError(
                "Please enter the property location."
            );
            return;
        }

        if (
            !formData.price ||
            Number(formData.price) <= 0
        ) {
            setError(
                "Please enter a valid price."
            );
            return;
        }

        try {
            setLoading(true);

            // ========================================
            // CREATE PROPERTY
            // ========================================

            const response = await api.post(
                "/properties",
                {
                    title:
                        formData.title.trim(),

                    description:
                        formData.description.trim(),

                    property_type:
                        formData.property_type,

                    listing_type:
                        formData.listing_type,

                    price:
                        Number(formData.price),

                    location:
                        formData.location.trim(),

                    bedrooms:
                        Number(
                            formData.bedrooms || 0
                        ),

                    bathrooms:
                        Number(
                            formData.bathrooms || 0
                        ),

                    area:
                        formData.area !== ""
                            ? Number(
                                formData.area
                            )
                            : null
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to submit property"
                );
            }

            // ========================================
            // GET NEW PROPERTY ID
            // ========================================

            const propertyId =
                response.data.propertyId;

            // ========================================
            // UPLOAD IMAGES
            // ========================================

            if (
                selectedImages.length > 0 &&
                propertyId
            ) {
                setUploadingImages(true);
                setSuccess(
                    "Property created. Uploading photos..."
                );

                const imageFormData =
                    new FormData();

                selectedImages.forEach(
                    (image) => {
                        imageFormData.append(
                            "images",
                            image
                        );
                    }
                );

                const imageResponse =
                    await api.post(
                        `/properties/${propertyId}/images`,
                        imageFormData,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data"
                            }
                        }
                    );

                if (
                    !imageResponse.data.success
                ) {
                    throw new Error(
                        imageResponse.data.message ||
                        "Property created, but image upload failed."
                    );
                }

                setUploadingImages(false);
            }

            // ========================================
            // SUCCESS
            // ========================================

            setSuccess(
                selectedImages.length > 0
                    ? "Property and photos uploaded successfully! Waiting for admin approval."
                    : "Property submitted successfully! Waiting for admin approval."
            );

            setTimeout(() => {
                navigate("/my-properties");
            }, 1800);

        } catch (err) {
            console.error(
                "Add property error:",
                err
            );

            if (
                err.response?.status === 401
            ) {
                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login");
                return;
            }

            setUploadingImages(false);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to submit property."
            );

        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    // ========================================
    // RETURN UI
    // ========================================

    return (
        <div className="add-property-page">

            <div className="add-property-container">

                {/* ========================================
                    HEADER
                ======================================== */}

                <div className="add-property-header">

                    <Link
                        to="/my-properties"
                        className="back-link"
                    >
                        ← Back to My Properties
                    </Link>

                    <h1>
                        List Your Property
                    </h1>

                    <p>
                        Add your property details
                        and photos, then submit
                        them for approval.
                    </p>

                </div>


                {/* ========================================
                    APPROVAL NOTICE
                ======================================== */}

                <div className="property-edit-notice">

                    <strong>
                        Approval process:
                    </strong>

                    <span>
                        Your property will be
                        reviewed by an admin before
                        it becomes visible to other
                        users.
                    </span>

                </div>


                {/* ========================================
                    ERROR
                ======================================== */}

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                {/* ========================================
                    SUCCESS
                ======================================== */}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}


                {/* ========================================
                    FORM
                ======================================== */}

                <form
                    className="property-form"
                    onSubmit={handleSubmit}
                >

                    {/* TITLE */}

                    <div className="form-group">

                        <label>
                            Property Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Luxury 3 BHK Apartment"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            placeholder="Describe your property..."
                            value={
                                formData.description
                            }
                            onChange={handleChange}
                            rows="5"
                        />

                    </div>


                    {/* PROPERTY TYPE + LISTING TYPE */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Property Type
                            </label>

                            <select
                                name="property_type"
                                value={
                                    formData.property_type
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >

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

                        </div>


                        <div className="form-group">

                            <label>
                                Listing Type
                            </label>

                            <select
                                name="listing_type"
                                value={
                                    formData.listing_type
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >

                                <option value="Sale">
                                    Sale
                                </option>

                                <option value="Rent">
                                    Rent
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* PRICE + LOCATION */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                placeholder="Enter price"
                                value={formData.price}
                                onChange={
                                    handleChange
                                }
                                min="1"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Noida"
                                value={
                                    formData.location
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* BEDROOMS + BATHROOMS + AREA */}

                    <div className="form-row three-columns">

                        <div className="form-group">

                            <label>
                                Bedrooms
                            </label>

                            <input
                                type="number"
                                name="bedrooms"
                                placeholder="0"
                                value={
                                    formData.bedrooms
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Bathrooms
                            </label>

                            <input
                                type="number"
                                name="bathrooms"
                                placeholder="0"
                                value={
                                    formData.bathrooms
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Area (sq. ft.)
                            </label>

                            <input
                                type="number"
                                name="area"
                                placeholder="e.g. 1450"
                                value={formData.area}
                                onChange={
                                    handleChange
                                }
                                min="0"
                            />

                        </div>

                    </div>


                    {/* ========================================
                        PHOTOS
                    ======================================== */}

                    <div className="form-group photo-upload-group">

                        <label>
                            Property Photos
                        </label>

                        <p className="photo-help">
                            Upload up to 5 photos.
                            JPG, JPEG, PNG or WEBP.
                            Maximum 5 MB per photo.
                        </p>

                        <input
                            type="file"
                            name="images"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            multiple
                            onChange={
                                handleImageChange
                            }
                        />

                        {/* PHOTO PREVIEWS */}

                        {selectedImages.length >
                            0 && (

                            <div className="image-preview-grid">

                                {selectedImages.map(
                                    (
                                        image,
                                        index
                                    ) => (

                                        <div
                                            className="image-preview"
                                            key={`${image.name}-${index}`}
                                        >

                                            <img
                                                src={URL.createObjectURL(
                                                    image
                                                )}
                                                alt={`Preview ${
                                                    index + 1
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() =>
                                                    removeImage(
                                                        index
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                            <span>
                                                Photo{" "}
                                                {index + 1}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>


                    {/* ========================================
                        BUTTONS
                    ======================================== */}

                    <div className="edit-property-buttons">

                        <Link
                            to="/my-properties"
                            className="secondary-btn"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={
                                loading ||
                                uploadingImages
                            }
                        >
                            {uploadingImages
                                ? "Uploading Photos..."
                                : loading
                                    ? "Submitting..."
                                    : "Submit Property"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddProperty;