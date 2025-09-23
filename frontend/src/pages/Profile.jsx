import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext } from "react";

function Profile () {
    const {name, username, email} = useContext(AuthContext);
    return (
        <MainLayout title='My Profile'>
            <h3>
                YAYY PROFILE
            </h3>
            <p>Name: {name}</p>
            <p>Username: {username}</p>
            <p>email: {email}</p>
        </MainLayout>
    )
};

export default Profile;