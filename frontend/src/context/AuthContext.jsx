import {useContext, useEffect, useState} from 'react';


//acts as container to hold context of authentication state
const AuthContext = useContext(null);


//write auth provider function; needs login function, verify login
//default export auth provider
//export auth context
//wrapp app in auth provider
//auth route that returns outlet if logged in, else navigates to desired page; protects page behind login
//wrap app.jsx routes in auth route

function AuthProvider() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [name, setName] = useState(null);
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [authError, setAuthError] = useState(null);

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
            throw new Error(`${response.status}`);
            }

            //create jwt token & store in local storage
            //return true 
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    //things: isLoggedIn (check on mount), login, token, username, name, email, set token, logout, authError IMPORT THIS IN LOGIN/SIGNUP
    //AND USE IT INSTEAD OF THE OTHER ERROR MESSAGE 
    return (
        <AuthContext.Provider value={{  }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
export {AuthContext};