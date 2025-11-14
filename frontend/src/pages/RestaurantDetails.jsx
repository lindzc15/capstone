import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout"



//gets folders from API then dynamically creates display cards for each 
const RestaurantDetails = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNotes, setShowNotes] = useState(false);
    const [locName, setLocName] = useState(null)
    const [address, setAddress] = useState(null);
    const [price, setPrice] = useState(null);
    const [rating, setRating] = useState(null);
    const [photoSrc, setPhotoSrc] = useState(null);
    const [hours, setHours] = useState(null);
    const [websiteURL, setWebsiteURL] = useState(null);
    const { username, isLoggedIn, authChecked } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const {folder_id, folder_name, restaurant_id} = location.state;


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
            setHours(place.regularOpeningHours.weekdayDescriptions);
            setWebsiteURL(place.websiteURI);
            
            setLoading(false);

            console.log(websiteURL);
            console.log(hours);

        }
        getPlaceFullDetails();
    }, []);

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
        return (
            <MainLayout title="Error">
                <div className="alert alert-danger">{error}</div>;
            </MainLayout>
        )
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
            <div className="row justify-content-center ms-auto me-auto">
                <div className="card shadow-lg p-3 rounded brown-txt details-card-big">
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
                                        {rating ? rating : 'No rating'}
                                    </p>
                                )}
                                <p className="card-text address-txt">{address[0] || 'Address unavailable'}</p>
                                <p className="card-text address-txt mb-3">{address[1] || ''}</p>
                                <div className="hours-div">
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
                                <a href={websiteURL} className="brown-txt link">Visit website</a>
                                    ) : (
                                        <div className="">
                                        </div>
                                )}
    
                            </div>
                </div>
        </div>
        </div>
        </MainLayout>
        
    )
}

export default RestaurantDetails;