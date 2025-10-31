import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";



const FolderAPI = ({alert}) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const jwt_token = JSON.parse(localStorage.getItem('token'));
        const fetchFolders = async () => {
            setLoading(true);
            setError(null);
            console.log('entered api');
            try {
                const response = await fetch("http://localhost:8080/api/folders", {
                        method: "POST",
                        body: JSON.stringify({
                            jwt_token: jwt_token
                        }),
                        // Adding headers to the request
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                }) 
                console.log('made it here');
                if (!response.ok) {
                    throw new Error("Failed to fetch folders");
                }
                const data = await response.json();
                console.log(data);
                console.log(data.folders_info);
                setFolders(data.folders_info);
            }
            catch (error) {
                console.log(error);
                    setError("No folders found");
            }
            finally {
                setLoading(false);
            }
        }

        fetchFolders();
    }, [alert]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary spinner" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>

        )
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }


    return (
        <div className="row ms-auto me-auto">
            {folders.map((folder) => (
                <div className="col-md-4 col-lg-3 d-flex justify-content-center" key={folder.folder_id}>
                    <div className="card shadow-lsm bg-body-tertiary rounded m-3 flex-grow-1 cursor">
                        <div className="card-color" style={{background: `${folder.color ? folder.color : '#FFFFFF'}`}}></div>
                        <div className="card-body">
                            <h5 className="card-title">{folder.folder_name}</h5>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FolderAPI;