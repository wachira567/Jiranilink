import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { userName, user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          JiraniLink
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>

        <SignedIn>
          <Link to="/catalog" className="nav-link">
            Catalog
          </Link>
          <Link to="/my-items" className="nav-link">
            My Items
          </Link>
          <Link to="/messages" className="nav-link">
            Messages
          </Link>
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
          <span className="welcome-text">Welcome, {userName}!</span>
          {user?.publicMetadata?.role && ["admin", "super_admin"].includes(user.publicMetadata.role) && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <Link to="/sign-in" className="nav-link">
            Sign In
          </Link>
          <Link to="/sign-up" className="nav-link">
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
};

export default Navbar;
