from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base, engine
from app.models.history import History
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.analysis import router as analysis_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")

@app.get("/")
def health():
    return {"message": "CodeLens API is running"}
