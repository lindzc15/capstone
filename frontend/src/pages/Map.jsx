import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext } from "react";

function Map () {
    const {name, username, email} = useContext(AuthContext);
    return (
        <MainLayout title='Map'>
            <div className="profile-div container d-flex flex-column flex-grow-1 justify-content-center">
            <h3 className="text-center mb-4 header-txt">Map</h3>
            </div>
        </MainLayout>
    )
};

export default Map;