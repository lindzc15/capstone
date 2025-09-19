import MainLayout from "../layouts/MainLayout"
import {useState, useRef} from 'react';

function SignUp() {
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [passConfirm, setPassConfirm] = useState("")

    const [error, setError] = useState("")

    const formRef = useRef(null);

    //remove error messages after typing?

    function handleSubmit(e) {
        e.preventDefault();

        const form = formRef.current;
        if(!form.checkValidity()) {
        }
        
        form.classList.add("was-validated");
        //check that passwords are the same
        //try to create account, if error display
        //else checked if logged in, if error display
        //if logged in navigate to profile page
    }
    return (
        <MainLayout title="Sign Up | Let's Eat">
            <div className="container d-flex flex-column flex-grow-1 justify-content-center">
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