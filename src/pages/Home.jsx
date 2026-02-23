import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page page-content">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Share Tools, <br />
            <span className="accent-text">Build Community.</span>
          </h1>
          <p className="hero-subtitle">
            Connect with your neighbors to borrow and lend items. 
            Foster trust and collaboration in your local region.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="btn-primary main-cta">
              Explore Catalog
            </Link>
            <Link to="/my-items" className="btn-secondary">
              Lend a Tool
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why JiraniLink?</h2>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>📍</div>
            <h3>Local Regions</h3>
            <p>Borrow from people in your immediate neighborhood. No more long drives.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
            <h3>Trusted Neighbors</h3>
            <p>Community governors verify identity and handle disputes locally.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>💸</div>
            <h3>Save Money</h3>
            <p>Why buy when you can borrow? Save thousands on tools you only use once.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
