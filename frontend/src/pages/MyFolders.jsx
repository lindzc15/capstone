import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext } from "react";

function MyFolders () {
    const {name, username, email} = useContext(AuthContext);
    return (
        <MainLayout title='My Folders'>
            <div className="profile-div container d-flex flex-column flex-grow-1 justify-content-center">
                <h3 className="text-center mb-4 header-txt">My Folders</h3>
                <div className="card">
                    <div className="card-color">
                    </div>
                    <div className="card-body">
                        <h5 className="card-title">Card title</h5>
                    </div>
                    </div>
                    <div class="fixed-bottom d-flex justify-content-center mb-5 pb-3">
                        <button type="button" class="btn btn-primary classicButton">
                            Add Folder
                        </button>
                    </div>
            </div>
        </MainLayout>
    )
};

export default MyFolders;