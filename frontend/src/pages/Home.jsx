import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">

            <section className="hero">

                <div className="hero-content">

                    <h1>
                        Find Your
                        <span> Perfect Property</span>
                    </h1>

                    <p>
                        Discover apartments, houses, villas and
                        commercial properties in your preferred location.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/properties"
                            className="primary-btn"
                        >
                            Explore Properties
                        </Link>

                        <Link
                            to="/add-property"
                            className="secondary-btn"
                        >
                            List Your Property
                        </Link>

                    </div>

                </div>

            </section>


            <section className="features">

                <div className="feature-card">
                    <div className="feature-icon">🏠</div>
                    <h3>Wide Range of Properties</h3>
                    <p>
                        Browse apartments, houses, villas,
                        plots and commercial properties.
                    </p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon">🔎</div>
                    <h3>Smart Search & Filters</h3>
                    <p>
                        Find exactly what you need using
                        location, price and property filters.
                    </p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon">🤝</div>
                    <h3>Connect With Owners</h3>
                    <p>
                        Contact property owners directly
                        and enquire about properties.
                    </p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon">❤️</div>
                    <h3>Save Favorites</h3>
                    <p>
                        Save properties you love and
                        access them whenever you want.
                    </p>
                </div>

            </section>

        </div>
    );
}

export default Home;