import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext } from "react";

function Profile () {
    const {name, username, email} = useContext(AuthContext);
    return (
        <MainLayout title='My Profile'>
            <div className="profile-div container d-flex flex-column flex-grow-1 justify-content-center">
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