import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useEffect, useRef, useState} from "react";
import { Map, useMap, AdvancedMarker, Pin} from "@vis.gl/react-google-maps";


function MapPage () {
    const {name, username, email} = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [locName, setLocName] = useState(null);
    const [address, setAddress] = useState([]);
    const [price, setPrice] = useState(null);
    const [photoSrc, setPhotoSrc] = useState(null);
    const [rating, setRating] = useState(null);

    const PRICE = {
        FREE: '',
        INEXPENSIVE: '$',
        MODERATE: '$$',
        EXPENSIVE: '$$$',
        VERY_EXPENSIVE: '$$$$'
    }

    const RATING = {
        1: '⭐️',
        2: '⭐️⭐️',
        3: '⭐️⭐️⭐️',
        4: '⭐️⭐️⭐️⭐️',
        5: '⭐️⭐️⭐️⭐️⭐️'
    }

    const mapID = import.meta.env.VITE_MAP_ID;
    const map = useMap();

    //default center of map to UVU
    const [center, setCenter] = useState({ lat: 40.261959, lng: -111.666412 }); 


    useEffect(() => {
        if(map) {
            map.addListener("click", displayPlaceInfo);
        }
    }, [map])


    //on mount, get user location, then set loading to false so spinner won't show
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
        mapSetUp();
    }, [])

    //when general map area clicked, close details panel
    //when poi clicked, show details panel with info
    function displayPlaceInfo(event) {
        if (event.placeId) {
            event.stop();
            getPlaceDetails(event.placeId);
        }
        else {
            console.log(`map clicked:`, event.latLng);
            setShowDetails(false);
        }
    }

    //fetches place info
    async function getPlaceDetails(id) {
        const { Place } = await google.maps.importLibrary("places");

        const place = new Place({
            id: id
        });

        await place.fetchFields({ 
            fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI', 'photos', 'priceLevel', 'rating']
        });

        const photoUrl = place.photos?.[0]?.getURI({ maxWidth: 600 });

        const roundedRating = Math.round(place.rating)

        const address = place.formattedAddress;
        const arrayAddress = address.split(/,(.+)/).map(p => p.trim());


        setShowDetails(true);
        setLocName(place.displayName);
        setAddress(arrayAddress);
        setPrice(PRICE[place.priceLevel]);
        setRating(RATING[roundedRating]);
        setPhotoSrc(photoUrl);
    }




    //show loading spinner until map loads
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


    return (
        <MainLayout title='Map'>
            <div className="container d-flex flex-column flex-grow-1 justify-content-center">
                <h3 className="text-center mb-4 header-txt">Map</h3>
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
                                    <div className="dropdown">
                                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Select Folder
                                        </button>
                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                                            <a className="dropdown-item" href="#">Action</a>
                                            <a className="dropdown-item" href="#">Another action</a>
                                            <a className="dropdown-item" href="#">Something else here</a>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn save-btn btn-primary mt-3 classicButton">
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