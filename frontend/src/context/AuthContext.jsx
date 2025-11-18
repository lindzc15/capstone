import {createContext, useEffect, useState} from 'react';
import { jwtDecode } from "jwt-decode";

//acts as container to hold context of authentication state
const AuthContext = createContext(null);

//specifies the authentication state info
export const AuthProvider = ( {children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState(null);
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [token, setToken] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    //extracts name from the jwt token, checking for errors
    function get_jwt_name(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.user?.name || null;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    }

    //extracts username from jwt token, checking for errors
    function get_jwt_username(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.user?.username || decoded.sub || null;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    }

    //extracts email from jwt token, checking for errors
    function get_jwt_email(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.user?.email || null;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    }

    //updates user info/logged in state on token changes, ensuring states are up to date with login status
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setName(decoded.user?.name || null);
                setUsername(decoded.user?.username || null);
                setEmail(decoded.user?.email || null);
                setIsLoggedIn(true);
            } catch (err) {
                console.error("Invalid token:", err);
                setIsLoggedIn(false);
                return null;
            }
        }
        else {
            setName(null);
            setUsername(null);
            setEmail(null);
            setIsLoggedIn(false);
        }
    }, [token]);

    //checks for token in local storage on page load
    //if found, send to server for verification
    useEffect(() => {
        const jwt_token = JSON.parse(localStorage.getItem("token"));
        verify_token(jwt_token);
    }, []);

    async function verify_token() {
            const token = JSON.parse(localStorage.getItem("token"));
            const url = "http://localhost:8080/api/login/verify";
            try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jwt_token: token }),
            });

            const login = await response.json();
            if (response.ok && login.success) {
                // Successful login
                localStorage.setItem("token", JSON.stringify(login.jwt_token));
                setName(get_jwt_name(login.jwt_token));
                setEmail(get_jwt_email(login.jwt_token));
                setUsername(get_jwt_username(login.jwt_token));
                setToken(login.jwt_token);
                setIsLoggedIn(true);
            } else {
                // Token invalid
                setIsLoggedIn(false);
                localStorage.removeItem("token");
            }
            } catch (error) {
            console.error(error);
            setIsLoggedIn(false);
            } finally {
            setAuthChecked(true);
            }
        }


    //send login credentials to server for authentication
    async function login(user, pass) {  
        const url = "http://localhost:8080/api/login/";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username: user, password: pass})
            }).catch(error => {
                console.log(`Error completing fetch: ${error}`);
                return false;
            })
            //if error from response, return false for login
            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData.detail);
                return false;
            }

            //if login wasn't successful, return false
            const login = await response.json();
            if (!login.success) {
                return false;
            }
            else {
                //if login was successful, store login token in local storage, set user info, set logged in to true
                localStorage.setItem("token", JSON.stringify(login.jwt_token));
                setToken(login.jwt_token);

                setName(get_jwt_name(login.jwt_token));
                setEmail(get_jwt_email(login.jwt_token));
                setUsername(get_jwt_username(login.jwt_token));

                setIsLoggedIn(true);
                return true;

            }
        } catch (error) {
            console.error(`Error completing login: ${error.message}`);
        }
    }


    //attempt new user registration, sending credentials to server
    async function register(username, name, email, pass) {
        const url = "http://localhost:8080/api/login/register";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username: username, full_name: name, email: email, password: pass})
            }).catch(error => {
                console.log(`Error completing fetch: ${error}`);
            })
            //if error from response, return false 
            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData.detail);
                return false;
            }

            //if registration failed, set error message
            //(this will be a controlled error message; only says if user/email taken, otherwise message is empty)
            const register = await response.json();
            if (!register.success) {
                setAuthError(register.message);
                return false;
            }
            else {
                //if registration successful, store returned token in local storage, set user info, set logged in to true
                localStorage.setItem("token", JSON.stringify(register.jwt_token));
                setToken(register.jwt_token);

                setName(get_jwt_name(register.jwt_token));
                setEmail(get_jwt_email(register.jwt_token));
                setUsername(get_jwt_username(register.jwt_token));

                setIsLoggedIn(true);

                //remove register errors 
                setAuthError("");
                return true;

            }
        } catch (error) {
            console.error(`Error completing registration: ${error.message}`);
        }
    }

    //log user out; remove user info/token from states, remove token from local storage
    function logout() {
        localStorage.removeItem('token');
        setName(null);
        setEmail(null);
        setUsername(null);

        setIsLoggedIn(false);
    }

    //allows authentication props to be accessed across the app
    return (
        <AuthContext.Provider value={{ login, name, username, email, isLoggedIn, logout, register, authError, authChecked, verify_token }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
export {AuthContext};