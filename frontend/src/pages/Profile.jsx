import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useEffect } from "react";


function Profile () {
    const {name, username, email, isLoggedIn} = useContext(AuthContext);

    //if token expires, log user out
    useEffect(() => {
            if (!isLoggedIn) {
                setError(null)
                console.log(`redirecting: ${isLoggedIn}`);
                navigate('/login');
            }
    }, [isLoggedIn]);

    return (
        <MainLayout title='My Profile'>
            <div className="profile-div container d-flex flex-column flex-grow-1">
            <h3 className="text-center mb-4 header-txt">My Profile</h3>
            <div className="card align-self-center">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item brown-txt mt-2 mb-2 profile-txt"><span className='bold'>Name:</span><span className='user-info'>{name}</span></li>
                    <li className="list-group-item brown-txt mt-2 mb-2 profile-txt"><span className='bold'>Username:</span><span className='user-info'>{username}</span></li>
                    <li className="list-group-item brown-txt mt-2 mb-2 profile-txt"><span className='bold'>Email:</span><span className='user-info'>{email}</span> </li>
                </ul>
            </div>
            </div>
        </MainLayout>
    )
};

export default Profile;