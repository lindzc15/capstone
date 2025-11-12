import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import {
  ControlPosition,
  MapControl,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";



function MapPage () {
    const {name, username, email, isLoggedIn} = useContext(AuthContext);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    //to hold info for restaurant details to display in side panel
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [locName, setLocName] = useState(null);
    const [address, setAddress] = useState([]);
    const [price, setPrice] = useState(null);
    const [photoSrc, setPhotoSrc] = useState(null);
    const [rating, setRating] = useState(null);
    const [id, setId] = useState(null);
    const [ratingNum, setRatingNum] = useState(false);
    const [priceString, setPriceString] = useState(false);
    const [addressString, setAddressString] = useState(false);

    const [selectedPlace, setSelectedPlace] = useState(null);
    const navigate = useNavigate();


    //if token expires, log user out
    useEffect(() => {
        if (!isLoggedIn) {
            setError(null)
            console.log(`redirecting: ${isLoggedIn}`);
            navigate('/login');
        }
    }, [isLoggedIn]);

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

    //uses map my saved map that displays food/drink establishments only
    const mapID = import.meta.env.VITE_MAP_ID;
    const map = useMap();

    //default center of map to UVU in case user location can't be obtained
    const [center, setCenter] = useState({ lat: 40.261959, lng: -111.666412 }); 


    //listens for clicks on map
    useEffect(() => {
        if(map) {
            map.addListener("click", displayPlaceInfo);
        }
    }, [map])


    //on mount, get user location and center the map on their location
    //once map has loaded remove spinner so map can be displayed
    //also get folder info to display in drop downs
    useEffect (() => {
        async function mapSetUp() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setCenter({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                        setLoading(false);
                    },
                    (error) => {
                        console.log("Error retrieving location");
                        setLoading(false);
                    }
                )
            }
            else {
                console.log("geolocation not supported");
                setLoading(false);
            }
        }

        //gets folders to display in drop down menu
        async function getFolders() {
            try {
                const jwt_token = JSON.parse(localStorage.getItem('token'));
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
                const data = await response.json();
                setFolders(data.folders_info);
            }
            catch (error) {
                console.log(error);
            }
        }

        mapSetUp();
        getFolders();
    }, [])

    //called when user clicks on map, to determine details panel status
    function displayPlaceInfo(event) {
        //if user clicked a place, stop default info window from showing
        //then get details of the place using the ID, to display info in details panel
        if (event.placeId) {
            event.stop();
            getPlaceDetails(event.placeId);
        }
        //if the user clicked on the map outside an icon, close the details panel
        else {
            console.log(`map clicked:`, event.latLng);
            setShowDetails(false);
        }
    }

    //fetches place info to display in side panel
    async function getPlaceDetails(id) {
        const { Place } = await google.maps.importLibrary("places");

        //creates place from id retrieved from click
        const place = new Place({
            id: id
        });

        console.log(place.id);
        //fetches fields that will be displayed in side panel
        await place.fetchFields({ 
            fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI', 'photos', 'priceLevel', 'rating']
        });

        
        const photoUrl = place.photos?.[0]?.getURI({ maxWidth: 600 });
        const roundedRating = Math.round(place.rating)

        //splits address to 2 lines
        const address = place.formattedAddress;
        const arrayAddress = address.split(/,(.+)/).map(p => p.trim());


        //sets all restaurant info
        //sets showDetails to true so that panel will open
        setShowDetails(true);
        setLocName(place.displayName);
        setAddress(arrayAddress);
        setPrice(PRICE[place.priceLevel]);
        setRating(RATING[roundedRating]);
        setPhotoSrc(photoUrl);
        setId(id);
        setRatingNum(place.rating);
        setPriceString(place.priceLevel);
        setAddressString(place.formattedAddress);
        console.log(place.rating);
        console.log(photoUrl);
    }




    //show a loading spinner until map loads
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

    //fits the map to the bounds of the searched place
    //then opens details panel with place info
    const MapHandler = ({ place}) => {
        const map = useMap();

        useEffect(() => {
            if (!map || !place) return;

            if (place.geometry?.viewport) {
            map.fitBounds(place.geometry?.viewport);
            }
        }, [map, place]);
        return null;
    };


    //handles map searching
    const PlaceAutocomplete = ({ onPlaceSelect }) => {
        const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
        const inputRef = useRef(null);
        const places = useMapsLibrary("places");

        useEffect(() => {
            if (!places || !inputRef.current) return;

            //limit search to restaurants/cafes/bars only
            //defaults to bias on map center
            const options = {
            fields: ["geometry", "name", "formatted_address", "place_id"],
            types: ["restaurant", "bar", "cafe", "bakery", "food"],
            };

            setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
        }, [places]);
        useEffect(() => {
            if (!placeAutocomplete) return;

            placeAutocomplete.addListener("place_changed", () => {
                //when place changed, set new place so map can adjust view
                //then call functions to open side panel and fetch details
                const place = placeAutocomplete.getPlace();
                console.log(place.place_id);
                setShowDetails(true);
                getPlaceDetails(place.place_id);
                onPlaceSelect(placeAutocomplete.getPlace());
            });
        }, [onPlaceSelect, placeAutocomplete]);
        return (
            <div className="autocomplete-container">
            <input ref={inputRef} />
            </div>
        );
    };

    async function saveRestaurant() {
        if (selectedFolder == null) {
            setError(true);
            setErrorMessage("Must select a folder!");
                setTimeout(() => {
                    setError(false);
                }, 1500);
            return;
        }
        const selectedFolderId = selectedFolder.folder_id;
        console.log(`folder id ${selectedFolderId}`);

        try {
            console.log(`${typeof(selectedFolderId)} ${selectedFolderId}, ${id} ${typeof(id)}, ${priceString} ${typeof(priceString)}, ${ratingNum}, ${typeof(ratingNum)}`);
            const jwt_token = JSON.parse(localStorage.getItem('token'));
            const response = await fetch("http://localhost:8080/api/folders/addrestaurant", {
                    method: "POST",
                    body: JSON.stringify({
                        folder_id: selectedFolderId,
                        restaurant_id: id,
                        rest_name: locName,
                        loc: addressString,
                        price_range: priceString,
                        avg_rating: ratingNum,
                        main_photo_url: photoSrc,
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
            const data = await response.json();
            if (data.success) {
                setAlert(true);
                setAlertMessage("Restaurant added!");
                setTimeout(() => {
                    setAlert(false);
                }, 1500);
            }
            if (!data.success) {
                setError(true);
                setErrorMessage("Restaurant already saved in this folder!");
                setTimeout(() => {
                    setError(false);
                }, 1500);
            }
        }
        catch (error) {
            console.log(error);
            setError(true);
            setErrorMessage("Error saving restaurant");
            setTimeout(() => {
                    setError(false);
                }, 1500);
            return;
        }
        }   

    return (
        <MainLayout title='Map'>
            <div className="container d-flex flex-column flex-grow-1 justify-content-center">
                <h3 className="text-center mb-4 header-txt">Map</h3>
                {alert && (
                            <div className="alert custom-alert position-absolute alert-below-header" role="alert">
                                {alertMessage}
                            </div>
                        )}
                {error && (
                            <div className="alert custom-error position-absolute alert-below-header bg-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}
                <div className="profile-div container d-flex flex-row flex-grow-1 justify-content-center">
                    <div id="map" className="shadow-lg p-3 mb-5 bg-body-tertiary rounded">
                        <Map
                            mapId={mapID}
                            defaultZoom={17}
                            defaultCenter={center}
                            fullscreenControl={false}
                            streetViewControl={false}
                            mapTypeControl={false}>
                        </Map>
                        <MapControl position={ControlPosition.TOP_LEFT}>
                            <div className="autocomplete-control">
                            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
                            </div>
                        </MapControl>
                        <MapHandler place={selectedPlace}/>
                    </div>
                    {showDetails && (
                        <div className="card details-card shadow-lg p-3 mb-5 bg-body-tertiary rounded brown-txt">
                            {photoSrc ? (
                                <img src={photoSrc} className="card-img-top card-img" alt={`${locName || 'Restaurant'} photo`}></img>
                            ) : (
                                <div className="card-img-top placeholder bg-secondary-subtle text-center py-5">
                                    <span>No image available</span>
                                </div>
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{locName || 'Unknown Place'}</h5>
                                {(price || rating) && (
                                    <p className="card-text price-txt">
                                        {price ? price : ''} 
                                        {price && rating ? ' | ' : ''} 
                                        {rating ? rating : 'No rating'}
                                    </p>
                                )}
                                <p className="card-text address-txt">{address[0] || 'Address unavailable'}</p>
                                <p className="card-text address-txt">{address[1] || ''}</p>
                                <div className="container d-flex flex-row flex-grow-1 justify-content-center">  
                                    <div className="dropdown mb-3">
                                        <button
                                            className="btn btn-secondary dropdown-toggle classicButton btn-tertiary"
                                            type="button"
                                            id="folderDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            {selectedFolder ? selectedFolder.folder_name : "Select a folder"}
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="folderDropdown">
                                            {folders.length > 0 ? (
                                            folders.map((folder, index) => (
                                                <li key={index}>
                                                <button
                                                    className="dropdown-item"
                                                    type="button"
                                                    onClick={() => setSelectedFolder(folder)}
                                                >
                                                    {folder.folder_name || folder.folder_id}
                                                </button>
                                                </li>
                                            ))
                                            ) : (
                                            <li>
                                                <span className="dropdown-item-text text-muted">No folders available</span>
                                            </li>
                                            )}
                                        </ul>
                                    </div>
                                    <button type="submit" className="btn save-btn btn-primary mt-3 classicButton" onClick={() => saveRestaurant()}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
};

export default MapPage;