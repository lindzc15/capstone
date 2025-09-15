import MainLayout from "../layouts/MainLayout";

const About = () => {
    return (
        <MainLayout title="About Us | Let's Eat">
            <div className="container text-center d-flex flex-column flex-grow-1 justify-content-center">
                <h1><span className='logo-txt'>About Let's Eat</span></h1>
                <p>Welcome to my UVU 4900 Capstone Project. I am creating a full stack web application for user to browse restaurants and save them
                    to custom created folders. I am using React for the frontend, Python's FastApi for the backend, PostgreSQL for the 
                    database, and Python/Postman for testing. 
                </p>
            </div>
        </MainLayout>
    );
};

export default About; 