import React, { useEffect } from "react";
import MainNav from "../pages/MainNav";
import MainFooter from "../pages/MainFooter";


const MainLayout = ({ children, title }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);
    return (
        <div className="d-flex flex-column main-container min-vh-100">
            <MainNav />
            <main className="d-flex flex-column flex-grow-1 flex-fill mt-4 z-0 full">
                {children}
            </main>
            <MainFooter />
        </div>
    );
};

export default MainLayout