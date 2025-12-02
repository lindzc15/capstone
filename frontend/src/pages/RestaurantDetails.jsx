import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout"



//gets folders from API then dynamically creates display cards for each 
const RestaurantDetails = () => {
    const { username, isLoggedIn, authChecked, verify_token } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const {folder_id, folder_name, restaurant_id} = location.state;
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    //holds states of restaurant info
    const [locName, setLocName] = useState(null)
    const [address, setAddress] = useState(null);
    const [price, setPrice] = useState(null);
    const [rating, setRating] = useState(null);
    const [photoSrc, setPhotoSrc] = useState(null);
    const [hours, setHours] = useState(null);
    const [websiteURL, setWebsiteURL] = useState(null);

    //holds states of restaurant notes
    const formRef = useRef(null);
    const [userRating, setUserRating] = useState(0);
    const [dateVisited, setDateVisited] = useState(null);
    const [favoriteFood, setFavoriteFood] = useState(null);
    const [notes, setNotes] = useState(null);


    //to simplify price range display
    const PRICE = {
        FREE: '',
        INEXPENSIVE: '$',
        MODERATE: '$$',
        EXPENSIVE: '$$$',
        VERY_EXPENSIVE: '$$$$'
    }

    //to simplify rating display
    const RATING = {
        0: '',
        1: '⭐️',
        2: '⭐️⭐️',
        3: '⭐️⭐️⭐️',
        4: '⭐️⭐️⭐️⭐️',
        5: '⭐️⭐️⭐️⭐️⭐️'
    }

    //if token expires, log user out
    useEffect(() => {
        if (authChecked && !isLoggedIn) {
            setError(null)
            console.log(`redirecting: ${isLoggedIn}`);
            navigate('/login');
        }
    }, [isLoggedIn, authChecked]);


    useEffect(() => {
        //retrieves additional restaurant details from google maps api
        async function getPlaceFullDetails() {
            const { Place } = await google.maps.importLibrary("places");

            //creates place from id retrieved from click
            const place = new Place({
                id: restaurant_id
            });


            //fetches fields that will be displayed in side panel
            await place.fetchFields({ 
                fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI', 'photos', 'priceLevel', 'rating', 'regularOpeningHours', 'websiteURI']
            });

            const photoUrl = place.photos?.[0]?.getURI({ maxWidth: 600 });
            const roundedRating = Math.round(place.rating)

            //splits address to 2 lines
            const address = place.formattedAddress;
            const arrayAddress = address.split(/,(.+)/).map(p => p.trim());


            //sets all restaurant info
            setLocName(place.displayName);
            setAddress(arrayAddress);
            setPrice(PRICE[place.priceLevel]);
            setRating(RATING[roundedRating]);
            setPhotoSrc(photoUrl);
            setHours(place.regularOpeningHours?.weekdayDescriptions);
            setWebsiteURL(place.websiteURI);
            
            setLoading(false);

            console.log(websiteURL);
            console.log(hours);

        }

        //get users notes on the given restaurant
        async function getUserNotes() {
            try {
                verify_token();
                const jwt_token = JSON.parse(localStorage.getItem('token'));
                const response = await fetch("http://localhost:8080/api/folders/get/notes", {
                        method: "POST",
                        body: JSON.stringify({
                            jwt_token: jwt_token,
                            restaurant_id: restaurant_id
                        }),
                        // Adding headers to the request
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                }) 
                if (!response.ok) {
                    throw new Error("Failed to fetch notes");
                }
                const data = await response.json();
                if (data.success) {
                    const notes = data.user_notes
                    setUserRating(notes.user_rating);
                    setDateVisited(notes.date_visited);
                    setFavoriteFood(notes.favorite_dish);
                    setNotes(notes.notes);
                }
            }
            catch (error) {
                console.log(error);
                setError(true);
                setErrorMessage(`Error retrieving your restaurant notes`);
                setTimeout(() => {
                        setError(false);
                    }, 1500);
                return;
            }
        }
        getUserNotes();
        getPlaceFullDetails();
    }, []);

    //save user notes for the given restuarant
    async function saveNotes() {
        verify_token();
        try {        
            verify_token();
            console.log(userRating, typeof(userRating));
            console.log(restaurant_id);
            console.log(dateVisited);
            console.log(favoriteFood);
            console.log(notes);
            const jwt_token = JSON.parse(localStorage.getItem('token'));
            const response = await fetch("http://localhost:8080/api/folders/add/notes", {
                    method: "POST",
                    body: JSON.stringify({
                        jwt_token: jwt_token,
                        restaurant_id: restaurant_id,
                        user_rating: userRating ? parseFloat(userRating) : 0,
                        date_visited: dateVisited ? dateVisited : "",
                        favorite_dish: favoriteFood ? favoriteFood : "",
                        notes: notes ? notes : ""
                    }),
                    // Adding headers to the request
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
            }) 
            if (!response.ok) {
                throw new Error("Failed to fetch notes");
            }
            const data = await response.json();
            if (data.success) {
                setShowAlert(true);
                setAlertMessage(`Notes updated!`);
                setTimeout(() => {
                    setShowAlert(false);
                }, 1500);
            return;
            }
        }
        catch (error) {
            console.log(error);
            setError(true);
            setErrorMessage(`Error saving your restaurant notes`);
            setTimeout(() => {
                    setError(false);
                }, 1500);
            return;
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary spinner" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            </MainLayout>
        )
    }

    function enableSaveBtn() {
        setButtonDisabled(false);
    }

    function navToFolder() {
        navigate('/myFolderContents', {state: {folder_id: folder_id, folder_name: folder_name}});
    }


    return (
        <MainLayout title="My Folders">
        <div className="container-fluid">
            <div className="d-flex align-items-center mb-4">
                <button className="btn save-btn btn-secondary back-btn me-3 classicButton" onClick={navToFolder} >
                        Back
                </button>
                <h3 className="text-center m-0 header-txt flex-grow-1 header-w-back">Restaurant Details</h3>
            </div>
            {showAlert && (
                            <div className="alert custom-alert position-absolute alert-below-header" role="alert">
                                {alertMessage}
                            </div>
            )}
            {error && (
                <div className="alert custom-error position-absolute alert-below-header bg-danger" role="alert">
                    {errorMessage}
                </div>
            )}
            <div className="row justify-content-center ms-auto me-auto">
                <div className="card shadow-lg p-3 rounded brown-txt details-card-big me-2">
                            {photoSrc ? (
                                <img src={photoSrc} className="card-img-top card-img-big" alt={`${locName || 'Restaurant'} photo`}></img>
                            ) : (
                                <div className="card-img-top placeholder bg-secondary-subtle text-center py-5">
                                    <span>No image available</span>
                                </div>
                            )}
                            <div className="card-body text-start">
                                <h5 className="card-title card-title-big">{locName || 'Unknown Place'}</h5>
                                {(price || rating) && (
                                    <p className="card-text price-txt">
                                        {price ? price : ''} 
                                        {price && rating ? ' | ' : ''} 
                                        {rating ? rating : ''}
                                    </p>
                                )}
                                <p className="card-text address-txt">{address[0] || 'Address unavailable'}</p>
                                <p className="card-text address-txt mb-3">{address[1] || ''}</p>
                                <div className="hours-div mb-5">
                                    <p className="card-title-big">Hours:</p>
                                {hours ? (
                                    hours.map((day, index) => (
                                        <p key={index}>{day}</p>
                                    ))
                                ) : (
                                    <div></div>
                                )}
                                </div>
                                {websiteURL ? (
                                <a href={websiteURL} target="_blank" className="brown-txt link">Visit website</a>
                                    ) : (
                                        <div className="">
                                        </div>
                                )}
    
                            </div>
                </div>
                <div className="card shadow-lg p-3 rounded brown-txt details-card-big ms-2">
                    <h3 className="card-title text-center mt-4 header-txt">My Restaurant Notes</h3>
                    <div className="card-body text-start">
                        <form className="needs-validation" noValidate ref={formRef}>
                            <div className="col-md-3 mb-5">
                                <label htmlFor="ratingSelect" className="card-title-big mb-2">My Rating</label>
                                <select className="custom-select rating-select" id="ratingSelect" 
                                    onChange={e => {
                                        setUserRating(e.target.value);
                                        enableSaveBtn();
                                    }}
                                    value={Math.floor(userRating)}
                                    >
                                    <option disabled value="0">Choose...</option>
                                    <option value="1">⭐️</option>
                                    <option value="2">⭐️⭐️</option>
                                    <option value="3">⭐️⭐️⭐️</option>
                                    <option value="4">⭐️⭐️⭐️⭐️</option>
                                    <option value="5">⭐️⭐️⭐️⭐️⭐️</option>
                                </select>
                            </div>

                            <label htmlFor="startDate" className="card-title-big mb-2">Date Visited</label>
                            <input id="startDate" className="form-control mb-5" type="date" 
                                onChange={(e) => {
                                    setDateVisited(e.target.value);
                                    enableSaveBtn();
                                }}
                                value={dateVisited}
                            />

                            
                            <div className="form-group">
                                <label htmlFor="favoriteDishTextArea" className="card-title-big mb-2">Favorite Menu Items</label>
                                <textarea className="form-control mb-5" id="FavoriteDishTextArea" rows="4" 
                                    onChange={e => {
                                        setFavoriteFood(e.target.value);
                                        enableSaveBtn();
                                    }}
                                    value={favoriteFood}>
                                </textarea>
                            </div>
                           
                           <div className="form-group">
                                <label htmlFor="favoriteDishTextArea" className="card-title-big mb-2">Other Notes</label>
                                <textarea className="form-control mb-5" id="FavoriteDishTextArea" rows="4" 
                                    onChange={e => {
                                        setNotes(e.target.value);
                                        enableSaveBtn();
                                    }}
                                    value={notes}>
                                </textarea>
                            </div>
                            
                            
                            <div className="container d-flex flex-row flex-grow-1 justify-content-center">  
                                <button type="button" className="btn btn-primary mt-3 classicButton" disabled={buttonDisabled} onClick={saveNotes}>
                                Save Changes
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
        </div>
        </div>
        </MainLayout>
        
    )
}

export default RestaurantDetails;