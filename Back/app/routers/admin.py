from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app import crud, schemas, models
from app.database import get_db
from app.dependencies import get_current_admin_user

router = APIRouter()

@router.get("/bookings", response_model=List[schemas.Booking], tags=["Admin Panel"])
async def admin_read_all_bookings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    bookings = await crud.get_all_bookings(db=db, skip=skip, limit=limit)
    return bookings

@router.get("/me", response_model=schemas.AdminUser, tags=["Admin Panel"])
async def read_admin_me(
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    return current_user