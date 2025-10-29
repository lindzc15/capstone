import MainLayout from "../layouts/MainLayout"

import {useState, useRef, useContext, useEffect} from 'react';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const {isLoggedIn, login} = useContext(AuthContext);
    const navigate = useNavigate();
    const formRef = useRef(null);

    //if logged in state changes to true, navigate to profile
    useEffect(() => {
    if (isLoggedIn && (location.pathname === '/login' || location.pathname === '/signup')) {
        console.log(`redirecting: ${isLoggedIn}, ${location.pathname}`);
        navigate('/profile');
    }
    }, [isLoggedIn, location.pathname]);


    //when login button clicked, attempt login
    async function handleSubmit(e) {
        e.preventDefault();

        //get the reference to the form
        const form = formRef.current;

        //reset error message for invalid credentials
        setError(null);

        //set form as validated, any invalid fields will get highlighted
        form.classList.add("was-validated");

        //check if any fields are invalid, stopping propogation if so
        if(!form.checkValidity()) {
            e.stopPropagation();
        }

        else {
            //all fields valid, try to login
            const loggedIn = await login(username, password);
            
            //if user logged in, state change will navigate to profile
            //if not, it will display error message
            if(loggedIn) {
                ("Logging in")
            }
            else {
                setError("Invalid Credentials");
            }
        }
    }
    return (
        <MainLayout title="Login | Let's Eat">
            <div className="container d-flex flex-column flex-grow-1 justify-content-center">
                <div className="row mx-auto mt-4 mb-4" style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="text-center">
                        <h3 className="text-center mb-4 header-txt">Login</h3>
                        <form onSubmit={handleSubmit} className="needs-validation" noValidate ref={formRef}>
                            {error && <div className="alert alert-danger" role="alert">
                                {error}
                            </div>}
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    id="floatingUsername"
                                    placeholder=""
                                    required
                                />
                                <label className="form-label" htmlFor="floatingUsername">Username</label>
                                <div className="invalid-feedback">
                                    Required field. Please enter a username.
                                </div>
                            </div>
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    id="floatingPassword"
                                    placeholder=""
                                    required
                                />
                                <label className="form-label" htmlFor="floatingPassword">Password</label>
                                <div className="invalid-feedback">
                                    Required field. Please enter a password.
                                </div>
                            </div>
                            <p className="brown-txt">New User? <a href="./signUp" className="red-txt">Sign Up</a></p>
                            <button type="submit" className="btn btn-primary mt-3 classicButton">
                                Log in
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Login;