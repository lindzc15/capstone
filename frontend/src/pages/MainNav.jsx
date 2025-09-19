import React from "react";
import { NavLink } from "react-router-dom";

const MainNav = () => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    <img src="/logo.svg" alt="logo" width="80" height="60" className="icon"></img>
                    <span className="ms-2 navText logo-txt">Let's Eat</span>
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse text-center" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink className="nav-link navText header-txt" to="/">About Us</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link navText header-txt" to="/login">Login</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link navText header-txt" to="/signUp">Sign Up</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default MainNav;