import { useContext, React } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

//will renavigate the user to the login page if trying to access protected page and aren't logged in
const AuthRoute = () => {
    const {isLoggedIn} = useContext(AuthContext);
    return isLoggedIn ? <Outlet/> : <Navigate to="/login"/>
}

export default AuthRoute;