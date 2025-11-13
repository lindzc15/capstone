import MainLayout from "../layouts/MainLayout"
import {useState, useRef, useContext, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function SignUp() {
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [passConfirm, setPassConfirm] = useState("")
    const [error, setError] = useState("")

    const nav = useNavigate();
    const {register, authError, isLoggedIn, authChecked} = useContext(AuthContext);

    //get the reference to the form
    const formRef = useRef(null);

    //if auth error state changes, set the error message to be displayed
    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    //if logged in state changes, navigate to profile if logged in
    useEffect(() => {
        if (authChecked && isLoggedIn) {
            navigate("/profile");
        }
    }, [authChecked, isLoggedIn, navigate]);


    //when sign up buton clicked, attempt to register new user
    async function handleSubmit(e) {
        e.preventDefault();
        const form = formRef.current;

        //set form as validated, any invalid fields will get highlighted
        form.classList.add("was-validated");

        //check if any fields are invalid, stopping propogation if so
        if(!form.checkValidity()) {
            e.stopPropagation();
            return;
        }
        
        //if passwords don't match, display error message
        if(pass != passConfirm) {
            setError("Passwords do not match");
        }
        else{
            //if passwords match, clear errors and attempt to register
            setError("");
            const registered = await register(username, name, email, pass);

            //if registration successful, state change will cause navigation to profile page
            //if unsuccessful, display error
            if (registered) {
                console.log("logging in");
                nav("/profile");
            }
            else {
                setError("Account registration failed");
            }
        }
    }
    return (
        <MainLayout title="Sign Up | Let's Eat">
            <div className="container d-flex flex-column flex-grow-1">
                <div className="row mx-auto mt-4 mb-4" style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="text-center">
                        <h3 className="text-center mb-4 header-txt">Sign Up</h3>
                        <form onSubmit={handleSubmit} noValidate ref={formRef} className="needs-validation">
                            {error && <div className="alert alert-danger" role="alert">
                                {error}
                            </div>}
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
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
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange = {e => setName(e.target.value)}
                                    id="floatingName"
                                    placeholder=""
                                    required
                                />
                                <label className="form-label" htmlFor="floatingName">Name</label>
                                <div className="invalid-feedback">
                                    Required field. Please enter a name.
                                </div>
                            </div>
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange= {e => setEmail(e.target.value)}
                                    id="floatingEmail"
                                    placeholder=""
                                    required
                                />
                                <label className="form-label" htmlFor="floatingEmail">Email</label>
                                <div className="invalid-feedback">
                                    Valid email required.
                                </div>
                            </div>
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="password"
                                    className="form-control"
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    id="floatingPassword"
                                    placeholder=""
                                    required
                                />
                                <label className="form-label" htmlFor="floatingPassword">Password</label>
                                <div className="invalid-feedback">
                                    Required field. Please enter a password.
                                </div>
                            </div>
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="password"
                                    className="form-control"
                                    value={passConfirm}
                                    onChange = {e => setPassConfirm(e.target.value)}
                                    id="floatingConfirmPassword"
                                    placeholder=""
                                    required
                                />
                                <label className="form-label" htmlFor="floatingConfirmPassword">Confirm Password</label>
                                <div className="invalid-feedback">
                                    Required field. Please confirm password.
                                </div>
                            </div>
                            <p className="brown-txt">Already have an account? <a href="./login" className="red-txt">Log in</a></p>
                            <button type="submit" className="btn btn-primary mt-3 classicButton">
                                Sign Up
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default SignUp;