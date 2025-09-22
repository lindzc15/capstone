import {createContext, useEffect, useState} from 'react';
import { jwtDecode } from "jwt-decode";

//acts as container to hold context of authentication state
const AuthContext = createContext(null);


//write auth provider function; needs login function, verify login
//default export auth provider
//export auth context
//wrapp app in auth provider
//auth route that returns outlet if logged in, else navigates to desired page; protects page behind login
//wrap app.jsx routes in auth route

export const AuthProvider = ( {children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState(null);
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [authError, setAuthError] = useState(null);

    function get_jwt_name(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.user?.name || null;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    }

    function get_jwt_username(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.user?.username || decoded.sub || null;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    }

    function get_jwt_email(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.user?.email || null;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    }

    async function login(user, pass) {
        //THIS IS TEMPLATE, NOT COMPLETE FUNCTION YET
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
            })
            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData.detail);
                return false;
            }

            //check if login successful
            const login = await response.json();
            if (!login.success) {
                return false;
            }
            else {
                //store login token in local storage, set user info, set logged in to true
                localStorage.setItem("token", JSON.stringify(login.jwt_token));

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

    //things: isLoggedIn (check on mount), login, token, username, name, email, set token, logout, authError IMPORT THIS IN LOGIN/SIGNUP
    //AND USE IT INSTEAD OF THE OTHER ERROR MESSAGE 
    return (
        <AuthContext.Provider value={{ login, name, username, email, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
export {AuthContext};