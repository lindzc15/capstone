import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useEffect, useRef, useState} from "react";
import { Map, useMap, AdvancedMarker, Pin} from "@vis.gl/react-google-maps";


function MapPage () {
    const {name, username, email} = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState([]);
    const [markersData, setMarkersData] = useState([]);

    const mapID = import.meta.env.VITE_MAP_ID;

    const map = useMap();



    //default center of map to UVU
    const [center, setCenter] = useState({ lat: 40.261959, lng: -111.666412 }); 


    //on mount, get user location, then set loading to false so spinner won't show
    useEffect (() => {
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
    }, [])

    //once map is loaded, do nearby search
    useEffect(() => {
        if (!map || loading) {
            return; 
        }
        nearbySearch();
    }, [map, loading]);


    async function nearbySearch() {
        const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places');
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
        const { spherical } = await google.maps.importLibrary('geometry');


        let bounds = map.getBounds();
        console.log(bounds);
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const diameter = spherical.computeDistanceBetween(ne, sw);
        const radius = Math.min((diameter / 2), 50000);
        const request = {
            // required parameters
            fields: ['displayName', 'location', 'formattedAddress', 'googleMapsURI', 'primaryType'],
            locationRestriction: {
                center,
                radius,
            },
            // optional parameters
            includedPrimaryTypes: ['restaurant', 'cafe', 'bar'],
            rankPreference: SearchNearbyRankPreference.POPULARITY
        };

        const { places } = await Place.searchNearby(request);
        setLocations(places);

        if (places.length) {
            const { LatLngBounds } = await google.maps.importLibrary("core");
            const bounds = new LatLngBounds();

            //remove all current markers
            setMarkersData([]);
            setLocations([]);

            places.forEach(place => {
                if (!place.location) {
                    return;
                }
                bounds.extend(place.location);

                const type = place.primaryType?.toLowerCase() || '';

                let iconURL;
                if (type.includes('cafe') || type.includes('coffee') || type.includes('coffee_shop')) {
                    iconURL = 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/cafe_pinlet.svg';
                } 
                else if (type.includes('bar')) {
                    iconURL = 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/bar_pinlet.svg';
                } 
                else {
                    iconURL = 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet.svg';
                }


                const pinElement = new PinElement({
                    background: '#DB1C07',
                    glyphSrc: new URL(iconURL),
                });


                const marker = new AdvancedMarkerElement ({
                    map: map,
                    position: place.location,
                    content: pinElement.element,
                    title: place.displayName
                });
                setMarkersData(prev => [...prev, marker]);
            })
        }
    }

    //add listener to open details when user clicks it

    //code that triggers when user drags
    //gets new center, calls nearby search if it is significant drag

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
            <div className="profile-div container d-flex flex-column flex-grow-1 justify-content-center">
                <h3 className="text-center mb-4 header-txt">Map</h3>
                <div id="map">
                    <Map
                        mapId={mapID}
                        defaultZoom={17}
                        defaultCenter={center}
                        fullscreenControl={false}
                        streetViewControl={false}>
                        {markersData.map((marker, index) => (
                        <AdvancedMarker
                            key={index} 
                            position={marker.position} 
                            content={marker.content}
                            title={marker.title}
                        />
                        ))}
                    </Map>
                </div>
            </div>
        </MainLayout>
    )
};

export default MapPage;