import MainLayout from "../layouts/MainLayout"


function Login() {
    return (
        <MainLayout title="Login | Let's Eat">
            <div className="container d-flex flex-column flex-grow-1 justify-content-center">
                <div className="row mx-auto mt-4 mb-4" style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="text-center">
                        <h3 className="text-center mb-4 header-txt">Login</h3>
                        <form>
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="email"
                                    className="form-control"
                                    value=""
                                    id="floatingUsername"
                                    placeholder=""
                                />
                                <label className="form-label" htmlFor="floatingUsername">Username</label>
                            </div>
                            <div className="col-sm-2 col-md-12 col-lg-12 mb-3 form-floating">
                                <input
                                    type="password"
                                    className="form-control"
                                    value=""
                                    id="floatingPassword"
                                    placeholder=""
                                />
                                <label className="form-label" htmlFor="floatingPassword">Password</label>
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