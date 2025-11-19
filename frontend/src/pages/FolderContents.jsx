import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout"



//gets folders from API then dynamically creates display cards for each 
const FolderContents = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username, isLoggedIn, authChecked, verify_token } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    console.log(location.state);
    const {folder_id, folder_name} = location.state;


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
            console.log("FROM MY FOLDERS");
            console.log(`redirecting: ${isLoggedIn}`);
            navigate('/login');
        }
    }, [isLoggedIn, authChecked]);

    useEffect(() => {
        //fetch restaurants from current folder
        const fetchRestaurants = async () => {
            setLoading(true);
            setError(null);
            try {
                verify_token();
                const response = await fetch("http://localhost:8080/api/folders/contents", {
                        method: "POST",
                        body: JSON.stringify({
                            folder_id: folder_id
                        }),
                        // Adding headers to the request
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                }) 
                if (!response.ok) {
                    throw new Error("Failed to fetch restaurants");
                }
                //sets folder info
                const data = await response.json();
                setRestaurants(data.contents);
                console.log(restaurants[0]);
            }
            catch (error) {
                console.log(error);
                    setError("No restaurants found");
            }
            finally {
                setLoading(false);
            }
        }

        fetchRestaurants();
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
        return (
            <MainLayout title="Error">
                <div className="alert alert-danger">{error}</div>;
            </MainLayout>
        )
    }

    function navToFolders() {
        navigate('/myFolders');
    }

    function navToDetails(restaurant_id) {
        navigate('/restaurantDetails', {state: {folder_id: folder_id, folder_name: folder_name, restaurant_id: restaurant_id}});
    }


    return (
        <MainLayout title="My Folders">
        <div className="container-fluid">
            <div className="d-flex align-items-center mb-4">
                <button className="btn save-btn btn-secondary back-btn me-3 classicButton" onClick={navToFolders} >
                        Back
                </button>
                <h3 className="text-center m-0 header-txt flex-grow-1 header-w-back">{folder_name}</h3>
            </div>
            <div className="row ms-auto me-auto">
            {/* For each folder, map the info to the correct place on the card */}
            {restaurants?.map((restaurant) => (
                <div className="card shadow-lg p-3 mb-5 bg-body-tertiary rounded brown-txt details-card-small cursor-pointer" onClick={() => navToDetails(restaurant.restaurant_id)}>
                            {restaurant.main_photo_url ? (
                                <img src={restaurant.main_photo_url} className="card-img-top card-img-small" alt={`${restaurant.rest_name || 'Restaurant'} photo`}></img>
                            ) : (
                                <div className="card-img-top placeholder bg-secondary-subtle text-center py-5">
                                    <span>No image available</span>
                                </div>
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{restaurant.rest_name || 'Unknown Place'}</h5>
                                {(restaurant.price_range || restaurant.avg_rating) && (
                                    <p className="card-text price-txt">
                                        {restaurant.price_range ? PRICE[restaurant.price_range] : ''} 
                                        {restaurant.price_range && restaurant.avg_rating ? ' | ' : ''} 
                                        {restaurant.avg_rating ? RATING[Math.round(restaurant.avg_rating)] : 'No rating'}
                                    </p>
                                )}
                                <p className="card-text address-txt">{restaurant.loc.split(/,(.+)/).map(p => p.trim())[0] || 'Address unavailable'}</p>
                                <p className="card-text address-txt">{restaurant.loc.split(/,(.+)/).map(p => p.trim())[1] || ''}</p>
                            </div>
                        </div>
            ))}
        </div>
        </div>
        </MainLayout>
        
    )
}

export default FolderContents;