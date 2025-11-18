import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";



//gets folders from API then dynamically creates display cards for each 
const FolderAPI = ({alert}) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username, isLoggedIn, verify_token, authChecked } = useContext(AuthContext);
    const navigate = useNavigate();

    //if token expires, log user out
    useEffect(() => {
        if (authChecked && !isLoggedIn) {
            setError(null)
            console.log("FROM MY FOLDERS");
            console.log(`redirecting: ${isLoggedIn}`);
            navigate('/login');
        }
    }, [isLoggedIn, authChecked]);

    useEffect(() => {
        verify_token();
        const jwt_token = JSON.parse(localStorage.getItem('token'));
        //fetch folders
        const fetchFolders = async () => {
            setLoading(true);
            setError(null);
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
                if (!response.ok) {
                    throw new Error("Failed to fetch folders");
                }
                //sets folder info
                const data = await response.json();
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

    function navigateToContents(folder_id, folder_name) {
        navigate('/myFolderContents', {state: {folder_id: folder_id, folder_name: folder_name}});
    }

    return (
        <div className="row ms-auto me-auto">
        {/* For each folder, map the info to the correct place on the card */}
            {folders.map((folder) => (
                <div className="col-md-4 col-lg-3 d-flex justify-content-center" key={folder.folder_id}>
                    <div className="card shadow-lsm bg-body-tertiary rounded m-3 flex-grow-1 cursor-pointer" onClick={() => navigateToContents(folder.folder_id, folder.folder_name)}>
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