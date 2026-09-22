# EstateHub – Real Estate Property Portal

EstateHub is a full-stack real estate web application that allows users to browse, search, filter, list, manage, and inquire about properties online.

The platform provides separate functionality for property users/owners and administrators, including property management, favorites, inquiries, authentication, image uploads, and property approval workflows.

---

## Project Overview

EstateHub is designed to simplify the process of buying, renting, and listing properties through a centralized web platform.

Users can:

- Create an account and log in securely
- Browse available properties
- Search and filter properties
- View detailed property information
- Add properties to favorites
- Contact property owners
- Add and manage their own properties
- Upload property images
- Edit or delete their properties
- Track property approval status

Administrators can:

- Access the admin dashboard
- Review submitted properties
- Approve or reject properties
- Manage the platform's property listings
- Monitor platform activity

---

## Features

### User Features

- User Registration
- User Login & Logout
- JWT-based Authentication
- Browse Properties
- Property Search
- Property Filtering
- Property Details
- Favorite Properties
- Contact Property Owner
- Add Property
- Edit Property
- Delete Property
- Upload Multiple Property Images
- View My Properties
- Property Approval Status

### Admin Features

- Admin Authentication
- Admin Dashboard
- View Submitted Properties
- Approve Properties
- Reject Properties
- Manage Property Listings
- Role-based Access

### Property Features

Each property can contain:

- Property Title
- Description
- Location
- Price
- Property Type
- Listing Type
- Number of Bedrooms
- Number of Bathrooms
- Area
- Property Images
- Approval Status

### Search & Filtering

Users can filter properties using:

- Location
- Property Type
- Listing Type
  - Sale
  - Rent
- Minimum Price
- Maximum Price
- Number of Bedrooms

### Image Management

EstateHub supports:

- Multiple property images
- Image upload using Multer
- Image preview
- Image deletion
- First uploaded image displayed as property thumbnail
- Static image serving through Express

---

# Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- HTML5
- CSS3
- JavaScript

## Backend

- Node.js
- Express.js
- JWT
- Multer
- REST API

## Database

- MySQL

## Development Tools

- VS Code
- Git
- GitHub
- Postman

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │       + Vite        │
                    └──────────┬──────────┘
                               │
                         REST API / Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js + Express │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌───────────┐    ┌────────────┐   ┌───────────┐
        │   JWT     │    │   Multer   │   │   REST    │
        │   Auth    │    │   Uploads  │   │   Routes  │
        └───────────┘    └────────────┘   └───────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │      Database       │
                    └─────────────────────┘
