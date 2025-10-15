import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext } from "react";

function MyFolders () {
    const {name, username, email} = useContext(AuthContext);
    return (
        <MainLayout title='My Folders'>
            <div className="profile-div container d-flex flex-column flex-grow-1 justify-content-center">
            <h3 className="text-center mb-4 header-txt">My Folders</h3>
            </div>
        </MainLayout>
    )
};

export default MyFolders;