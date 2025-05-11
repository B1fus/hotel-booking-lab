from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.routers import auth, rooms, bookings, admin
from app.database import Base, engine 
from app.core.config import settings

app = FastAPI(
    title="Booking API",
    description="API для бронирования комнат",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json", 
    docs_url="/api/v1/docs",           
    redoc_url="/api/v1/redoc"          
)

origins = [
    "http://localhost",         
    "http://localhost:8080",    
    "http://localhost:3000",    
    "http://127.0.0.1",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          
    allow_credentials=True,       
    allow_methods=["*"],          
    allow_headers=["*"],          
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.exception_handler(ValidationError) 
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
     return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

api_prefix = "/api/v1"
app.include_router(auth.router, prefix=f"{api_prefix}/auth")
app.include_router(rooms.router, prefix=f"{api_prefix}/rooms")
app.include_router(bookings.router, prefix=f"{api_prefix}/bookings")
app.include_router(admin.router, prefix=f"{api_prefix}/admin")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Hotel Booking API. Visit /api/v1/docs for documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)