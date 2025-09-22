from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import login_controller, api_status
from container import Container


#create server
app = FastAPI(title="CS 4900 Capstone", version="1.0.0")

#add my frontend as an origin
origins = [
    "http://localhost:5173"
]

#allow my frontend full access to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#add container for dependency injection
container = Container()
app.container = container

#add controllers to the server
app.include_router(login_controller.router)
app.include_router(api_status.router)

