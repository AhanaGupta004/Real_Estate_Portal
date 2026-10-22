import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

function EditProperty() {
    const { id } = useParams();
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

    // ========================================
    // PHOTO STATES
    // ========================================

    const [existingImages, setExistingImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ========================================
    // FETCH PROPERTY
    // ========================================

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get(
                    `/properties/${id}`
                );

                if (!response.data.success) {
                    throw new Error(
                        response.data.message ||
                        "Failed to load property"
                    );
                }

                const property =
                    response.data.property;

                setFormData({
                    title: property.title || "",
                    description:
                        property.description || "",
                    property_type:
                        property.property_type ||
                        "Apartment",
                    listing_type:
                        property.listing_type ||
                        "Sale",
                    price: property.price || "",
                    location:
                        property.location || "",
                    bedrooms:
                        property.bedrooms ?? "",
                    bathrooms:
                        property.bathrooms ?? "",
                    area:
                        property.area ?? ""
                });

                setExistingImages(
                    property.images || []
                );

            } catch (err) {
                console.error(
                    "Edit property error:",
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

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load property."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id, navigate]);

    // ========================================
    // HANDLE INPUT CHANGE
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
    // SELECT NEW IMAGES
    // ========================================

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        setError("");

        if (files.length === 0) {
            return;
        }

        // Current total
        const totalImages =
            existingImages.length +
            selectedImages.length +
            files.length;

        if (totalImages > 5) {
            setError(
                `You can have a maximum of 5 photos. You currently have ${existingImages.length + selectedImages.length}.`
            );

            e.target.value = "";
            return;
        }

        // Allowed file types
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

        // Maximum 5 MB per file
        const oversizedFile = files.find(
            (file) =>
                file.size >
                5 * 1024 * 1024
        );

        if (oversizedFile) {
            setError(
                "Each photo must be smaller than 5 MB."
            );

            e.target.value = "";
            return;
        }

        setSelectedImages(
            (currentImages) => [
                ...currentImages,
                ...files
            ]
        );

        e.target.value = "";
    };

    // ========================================
    // REMOVE NEWLY SELECTED IMAGE
    // ========================================

    const removeSelectedImage = (index) => {
        setSelectedImages(
            (currentImages) =>
                currentImages.filter(
                    (_, imageIndex) =>
                        imageIndex !== index
                )
        );
    };

    // ========================================
    // DELETE EXISTING IMAGE
    // ========================================

    const deleteExistingImage = async (
        imageId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to remove this photo?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response =
                await api.delete(
                    `/properties/${id}/images/${imageId}`
                );

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    "Failed to delete image"
                );
            }

            setExistingImages(
                (currentImages) =>
                    currentImages.filter(
                        (image) =>
                            image.id !==
                            imageId
                    )
            );

            setSuccess(
                "Photo removed successfully."
            );

        } catch (err) {
            console.error(
                "Delete property image error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to remove photo."
            );
        }
    };

    // ========================================
    // UPLOAD NEW IMAGES
    // ========================================

    const uploadNewImages = async () => {
        if (
            selectedImages.length === 0
        ) {
            return true;
        }

        try {
            setUploadingImages(true);

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

            const response =
                await api.post(
                    `/properties/${id}/images`,
                    imageFormData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    "Failed to upload photos"
                );
            }

            setSelectedImages([]);

            return true;

        } catch (err) {
            console.error(
                "Upload images error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to upload photos."
            );

            return false;

        } finally {
            setUploadingImages(false);
        }
    };

    // ========================================
    // SUBMIT FORM
    // ========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // ========================================
        // BASIC VALIDATION
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

        // Maximum 5 photos
        if (
            existingImages.length +
            selectedImages.length >
            5
        ) {
            setError(
                "A property can have a maximum of 5 photos."
            );
            return;
        }

        try {
            setSaving(true);

            // ========================================
            // UPDATE PROPERTY DETAILS
            // ========================================

            const response =
                await api.put(
                    `/properties/${id}`,
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
                            Number(
                                formData.price
                            ),

                        location:
                            formData.location.trim(),

                        bedrooms:
                            Number(
                                formData.bedrooms ||
                                0
                            ),

                        bathrooms:
                            Number(
                                formData.bathrooms ||
                                0
                            ),

                        area:
                            formData.area !==
                            ""
                                ? Number(
                                    formData.area
                                )
                                : null
                    }
                );

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    "Failed to update property"
                );
            }

            // ========================================
            // UPLOAD NEW PHOTOS
            // ========================================

            const imagesUploaded =
                await uploadNewImages();

            if (!imagesUploaded) {
                setSaving(false);
                return;
            }

            // ========================================
            // SUCCESS
            // ========================================

            setSuccess(
                "Property and photos updated successfully! It has been sent for admin re-approval."
            );

            setTimeout(() => {
                navigate(
                    "/my-properties"
                );
            }, 1800);

        } catch (err) {
            console.error(
                "Update property error:",
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

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update property."
            );

        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="page-container">

                <p>
                    Loading property...
                </p>

            </div>
        );
    }

    // ========================================
    // LOAD ERROR
    // ========================================

    if (
        error &&
        !formData.title
    ) {
        return (
            <div className="page-container">

                <h2>
                    Unable to load property
                </h2>

                <p>
                    {error}
                </p>

                <Link
                    to="/my-properties"
                    className="back-link"
                >
                    ← Back to My Properties
                </Link>

            </div>
        );
    }

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="add-property-page">

            <div className="add-property-container">

                {/* HEADER */}

                <div className="add-property-header">

                    <Link
                        to="/my-properties"
                        className="back-link"
                    >
                        ← Back to My Properties
                    </Link>

                    <h1>
                        Edit Property
                    </h1>

                    <p>
                        Update your property
                        information and photos.
                    </p>

                </div>


                {/* RE-APPROVAL NOTICE */}

                <div className="property-edit-notice">

                    <strong>
                        Important:
                    </strong>

                    <span>
                        Any changes you make will
                        send this property back to
                        the admin for approval.
                    </span>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}


                {/* FORM */}

                <form
                    className="property-form"
                    onSubmit={handleSubmit}
                >

                    {/* ========================================
                        PROPERTY TITLE
                    ======================================== */}

                    <div className="form-group">

                        <label>
                            Property Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={
                                formData.title
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter property title"
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
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Describe your property"
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
                                value={
                                    formData.price
                                }
                                onChange={
                                    handleChange
                                }
                                min="1"
                                placeholder="Enter price"
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
                                value={
                                    formData.location
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Noida"
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
                                value={
                                    formData.bedrooms
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                placeholder="0"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Bathrooms
                            </label>

                            <input
                                type="number"
                                name="bathrooms"
                                value={
                                    formData.bathrooms
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                placeholder="0"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Area (sq. ft.)
                            </label>

                            <input
                                type="number"
                                name="area"
                                value={
                                    formData.area
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                placeholder="e.g. 1200"
                            />

                        </div>

                    </div>


                    {/* ========================================
                        EXISTING PHOTOS
                    ======================================== */}

                    <div className="form-group">

                        <label>
                            Existing Photos
                        </label>

                        <p className="photo-help">
                            {existingImages.length}
                            {" "}of 5 photos currently
                            uploaded.
                        </p>

                        {existingImages.length >
                        0 ? (

                            <div className="edit-image-grid">

                                {existingImages.map(
                                    (
                                        image,
                                        index
                                    ) => (

                                        <div
                                            className="edit-image-card"
                                            key={
                                                image.id
                                            }
                                        >

                                            <img
                                                src={getImageUrl(
                                                    image
                                                )}
                                                alt={`Property ${
                                                    index +
                                                    1
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                className="remove-existing-image-btn"
                                                onClick={() =>
                                                    deleteExistingImage(
                                                        image.id
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                            <span>
                                                Photo{" "}
                                                {index +
                                                    1}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="no-existing-images">
                                No photos uploaded yet.
                            </div>

                        )}

                    </div>


                    {/* ========================================
                        ADD NEW PHOTOS
                    ======================================== */}

                    <div className="form-group photo-upload-group">

                        <label>
                            Add New Photos
                        </label>

                        <p className="photo-help">
                            You can add up to{" "}
                            {5 -
                                existingImages.length -
                                selectedImages.length}
                            {" "}more photo(s).
                            JPG, JPEG, PNG or WEBP.
                            Maximum 5 MB per photo.
                        </p>

                        {existingImages.length +
                            selectedImages.length <
                            5 && (

                            <input
                                type="file"
                                name="images"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={
                                    handleImageChange
                                }
                            />

                        )}


                        {/* NEW PHOTO PREVIEWS */}

                        {selectedImages.length >
                            0 && (

                            <div className="edit-image-grid">

                                {selectedImages.map(
                                    (
                                        image,
                                        index
                                    ) => (

                                        <div
                                            className="edit-image-card new-image-card"
                                            key={`${image.name}-${index}`}
                                        >

                                            <img
                                                src={URL.createObjectURL(
                                                    image
                                                )}
                                                alt={`New photo ${
                                                    index +
                                                    1
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                className="remove-existing-image-btn"
                                                onClick={() =>
                                                    removeSelectedImage(
                                                        index
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                            <span>
                                                New Photo
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
                                saving ||
                                uploadingImages
                            }
                        >
                            {uploadingImages
                                ? "Uploading Photos..."
                                : saving
                                    ? "Saving..."
                                    : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditProperty;