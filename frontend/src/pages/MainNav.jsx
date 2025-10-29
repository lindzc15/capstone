import {React, useContext, useEffect, useState, useRef} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const MainNav = () => {
    const {isLoggedIn, logout} = useContext(AuthContext);
    const nav = useNavigate();

    //tracks state of logout to determin if it should be displayed or not
    const [modal, setModal] = useState(false);

    //user has confirmed logout, perform logout and hide modal, navigating back to login page
    function handleLogout() {
        logout();
        setModal(false);
        nav("/login");
    }
    
    //modal closed, hide it
    function hideModal() {
        setModal(false);
    }
    
    //user clicked logout, ask for confirmation by displaying modal
    function showModal() {
        console.log("logging out?")
        setModal(true);
    }

    //nav bar will display differently for logged in vs logged out users
    return (
        <nav className="navbar navbar-expand-lg sticky-top z-3">
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
                        {!isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link navText header-txt" to="/login">Login</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link navText header-txt" to="/signUp">Sign Up</NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link navText header-txt" to="/map">Map</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link navText header-txt" to="/search">Search</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link navText header-txt" to="/myFolders">My Folders</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link navText header-txt" to="/profile">Profile</NavLink>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        onClick={showModal}
                                        className="navText header-txt nav-link"
                                        id="logout-nav"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
            {modal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h5 className="modal-title">Logging Out</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={hideModal}></button>
                        </div>
                        <div className="modal-body">
                        <p>Are you sure you want to logout?</p>
                        </div>
                        <div className="modal-footer">
                        <button type="button" className="btn btn-modal" onClick={handleLogout}>Logout</button>
                        <button type="button" className="btn btn-tertiary" onClick={hideModal}>Cancel</button>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default MainNav;