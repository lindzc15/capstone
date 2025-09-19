from fastapi import FastAPI
from controllers import login_controller, api_status
from container import Container


#create server
app = FastAPI(title="CS 4900 Capstone", version="1.0.0")
container = Container()
app.container = container

#add controllers to the server
app.include_router(login_controller.router)
app.include_router(api_status.router)

