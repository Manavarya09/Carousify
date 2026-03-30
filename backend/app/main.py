from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import auth, projects, templates, export, ai

load_dotenv()

app = FastAPI(
    title="Carousify API",
    description="Instagram Grid Carousel Maker API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Features"])


@app.get("/")
async def root():
    return {"message": "Welcome to Carousify API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
