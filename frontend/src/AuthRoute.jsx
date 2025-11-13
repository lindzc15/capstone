import { useContext, React } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";

//will renavigate the user to the login page if trying to access protected page and aren't logged in
const AuthRoute = () => {
  const { isLoggedIn, authChecked } = useContext(AuthContext);

  if (!authChecked) {
    return null;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthRoute;