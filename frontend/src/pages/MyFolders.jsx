import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FolderAPI from "./APIs/FolderAPI";

function MyFolders () {
    const {name, username, email, isLoggedIn} = useContext(AuthContext);
    const formRef = useRef(null);
    const [error, setError] = useState("");
    const [color, setColor] = useState('#DB1C07');
    const [folderName, setFolderName] = useState(null);
    const [alert, setAlert] = useState(false);
    const navigate = useNavigate();


    //if token expires, log user out
    useEffect(() => {
        if (!isLoggedIn) {
            setError(null)
            console.log(`redirecting: ${isLoggedIn}`);
            navigate('/login');
        }
    }, [isLoggedIn]);

    //tracks state of modal to determine if it should be displayed or not
    const [modal, setModal] = useState(false);

    //modal closed, hide it
    function hideModal() {
        setModal(false);
    }
    
    //user clicked logout, ask for confirmation by displaying modal
    function showModal() {
        setModal(true);
    }

    //handle add folder button pressed
    async function addFolder(e) {
        e.preventDefault();

        const form = formRef.current;
        //reset error message for invalid credentials
        setError(null);

        //set form as validated, any invalid fields will get highlighted
        form.classList.add("was-validated");

        //check if any fields are invalid, stopping propogation if so
        if(!form.checkValidity()) {
            e.stopPropagation();
        }

        else {
            console.log('entered api');
            try {
                //try to add folder
                const jwt_token = JSON.parse(localStorage.getItem('token'));
                const response = await fetch("http://localhost:8080/api/folders/add", {
                        method: "POST",
                        body: JSON.stringify({
                            folder_name: folderName,
                            color: color,
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
                //close form, show success alert
                const data = await response.json();
                hideModal();
                setAlert(true);
                setTimeout(() => {
                    setAlert(false);
                }, 1500);
            }
            catch (error) {
                console.log(error);
                setError("Error adding folder");
            }
        }
    }

    return (
        <MainLayout title='My Folders'>
                <h3 className="text-center mb-4 header-txt">My Folders</h3>
                        {alert && (
                            <div className="alert custom-alert position-absolute alert-below-header" role="alert">
                                Folder added!
                            </div>
                        )}

                <div className="container-fluid">
                        <div>
                            <FolderAPI alert={alert}></FolderAPI>
                        </div>
                    <div className="fixed-bottom d-flex justify-content-center mb-5 pb-3">
                        <button type="button" className="btn btn-primary classicButton" onClick={showModal}>
                            Add Folder
                        </button>
                    </div>
            {modal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h5 className="modal-title">Add Folder</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={hideModal}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger" role="alert">
                                {error}
                            </div>}
                            <form className="needs-validation" noValidate ref={formRef}>
                                <div className="form-floating mb-3">       
                                <input type="text" className="form-control" id="floatingName" onChange={(e) => setFolderName(e.target.value)} required></input>
                                <label htmlFor="floatingName">Folder Name</label>
                                <div className="d-flex align-items-center gap-2 mt-4">
                                    <label htmlFor="myColor" className="form-label mb-0">Folder Color:</label>
                                    <input
                                        type="color"
                                        id="myColor"
                                        value={color}
                                        className="form-control-color border-0"
                                        title="Choose a color"
                                        onChange={(e) => setColor(e.target.value)}
                                    />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                        <button type="button" className="btn btn-modal" onClick={addFolder}>Add</button>
                        <button type="button" className="btn btn-tertiary cancel-btn" onClick={hideModal}>Cancel</button>
                        </div>
                    </div>
                    </div>
                </div>
            )}
            </div> 
        </MainLayout>
    )
};

export default MyFolders;



