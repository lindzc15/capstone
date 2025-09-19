import MainLayout from "../layouts/MainLayout"

import {useState, useRef} from 'react';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const formRef = useRef(null);

    //remove error messages after typing


    function handleSubmit(e) {
        e.preventDefault();

        const form = formRef.current;
        if(!form.checkValidity()) {
            e.stopPropagation();
        }
        
        form.classList.add("was-validated");


        //custom form validation? require no empty fields, add invalid class if so
        //try to create account, if error display
        //else checked if logged in, if error display
        //if logged in navigate to profile page
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