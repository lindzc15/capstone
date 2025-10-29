import React from "react";

const MainFooter = () => {
    return (
        <footer className="text-center">
            <p>&copy; {new Date().getFullYear()}<span className='logo-txt ms-2 mt-auto'>Let's Eat</span></p>
        </footer>
    );
};

export default MainFooter;