from fastapi import FastAPI

from controllers import login_controller, api_status


app = FastAPI(title="CS 4900 Capstone", version="1.0.0")

app.include_router(login_controller.router)
app.include_router(api_status.router)

