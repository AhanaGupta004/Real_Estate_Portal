import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import EditProperty from "./pages/EditProperty";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* HOME */}

                <Route
                    path="/"
                    element={<Home />}
                />

                {/* PROPERTIES */}

                <Route
                    path="/properties"
                    element={<Properties />}
                />

                <Route
                    path="/properties/:id"
                    element={<PropertyDetails />}
                />

                {/* AUTH */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* USER */}

                <Route
                    path="/add-property"
                    element={<AddProperty />}
                />

                <Route
                    path="/my-properties"
                    element={<MyProperties />}
                />

                <Route
                    path="/edit-property/:id"
                    element={<EditProperty />}
                />

                <Route
                    path="/favorites"
                    element={<Favorites />}
                />

                {/* ADMIN */}

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;