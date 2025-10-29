import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout"
import { useContext, useRef, useState } from "react";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

function Search () {
    const {name, username, email} = useContext(AuthContext);
    const searchBarRef = useRef(null);
    const [searchResult, setSearchResult] = useState('')

    function onLoad(autocomplete) {
        setSearchResult(autocomplete);
    }

    function onPlaceChanged() {
        if (searchResult != null) {
        //variable to store the result
        const place = searchResult.getPlace();
        //variable to store the name from place details result 
        const name = place.name;
        //variable to store the status from place details result
        const status = place.business_status;
        //variable to store the formatted address from place details result
        const formattedAddress = place.formatted_address;
        // console.log(place);
        //console log all results
        console.log(`Name: ${name}`);
        console.log(`Business Status: ${status}`);
        console.log(`Formatted Address: ${formattedAddress}`);
        } else {
        alert("Please enter text");
        }
    }

    return (
        <MainLayout title='Search'>
            <div className="profile-div container d-flex flex-column flex-grow-1 text-align-center">
                <h3 className="text-center mb-4 header-txt">Search</h3>
                <Autocomplete onPlaceChanged={onPlaceChanged} onLoad={onLoad}>
                    <input id="search-input" type="text" placeholder="Search for places..." ref={searchBarRef}></input>
                </Autocomplete>
            </div>
        </MainLayout>
    )
};

export default Search;