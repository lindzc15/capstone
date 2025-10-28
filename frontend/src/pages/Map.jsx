import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Map, useMap} from "@vis.gl/react-google-maps";


function MapPage () {
    const {name, username, email} = useContext(AuthContext);
    const mapDivRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const mapID = import.meta.env.VITE_MAP_ID;



    //default center of map to UVU
    const [center, setCenter] = useState({ lat: 40.261959, lng: -111.666412 }); 


    //on mount, get user location, then set loading to false so spinner won't show
    //then get nearby restaurants to show on map
    //maybe need to update map center when user drags?
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
                <div id="map" ref={mapDivRef}>
                    <Map
                        mapId={mapID}
                        defaultZoom={17}
                        defaultCenter={center}
                        type={['restaurant']}>
                    </Map>
                </div>
            </div>
        </MainLayout>
    )
};

export default MapPage;