import React from "react";
import MainLayout from "../layouts/MainLayout";

const NotFound = () => {
    return (
        <MainLayout title="Page Not Found">
            <div className="container text-center">
                <div>
                    <h1>Not Found</h1>
                    <p>Something super terrible has happened and the page you
                        are looking for doesn't even exist{":("}
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default NotFound; 