from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app import crud, schemas, models
from app.database import get_db
from app.dependencies import get_current_admin_user 

router = APIRouter()

@router.get("/", response_model=List[schemas.Room], tags=["Rooms"])
async def read_rooms(
    skip: int = 0,
    limit: int = 100,
    price_min: Optional[float] = Query(None, ge=0, description="Минимальная цена за ночь"),
    price_max: Optional[float] = Query(None, description="Максимальная цена за ночь"),
    capacity_min: Optional[int] = Query(None, ge=1, description="Минимальная вместимость"),
    bed_type: Optional[str] = Query(None, description="Тип кровати (частичное совпадение)"),
    check_in_date: Optional[date] = Query(None, description="Дата заезда для проверки доступности"),
    check_out_date: Optional[date] = Query(None, description="Дата выезда для проверки доступности"),
    db: AsyncSession = Depends(get_db)
):
    filters = schemas.RoomFilterParams(
        price_min=price_min,
        price_max=price_max,
        capacity_min=capacity_min,
        bed_type=bed_type,
        check_in_date=check_in_date,
        check_out_date=check_out_date
    )
    try:
        
        pass
    except ValueError as e:
         raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    rooms = await crud.get_rooms(db=db, filters=filters, skip=skip, limit=limit)
    return rooms


@router.get("/{room_id}", response_model=schemas.Room, tags=["Rooms"])
async def read_room(room_id: int, db: AsyncSession = Depends(get_db)):
    db_room = await crud.get_room(db=db, room_id=room_id)
    if db_room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return db_room



@router.post("/", response_model=schemas.Room, status_code=status.HTTP_201_CREATED, tags=["Rooms", "Admin"])
async def create_room(
    room: schemas.RoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user) 
):
    db_room = models.Room(**room.model_dump())
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    
    db_room.images = [] 
    return db_room

@router.post("/{room_id}/images", response_model=schemas.RoomImage, status_code=status.HTTP_201_CREATED, tags=["Rooms", "Admin"])
async def add_image_to_room(
    room_id: int,
    image: schemas.RoomImageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    db_room = await crud.get_room(db=db, room_id=room_id)
    if db_room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    db_image = await crud.add_room_image(db=db, room_id=room_id, image_data=image)
    return db_image

@router.get("/{room_id}/booked-dates", response_model=List[schemas.BookedDateRange], tags=["Rooms", "Bookings"])
async def read_room_booked_dates(room_id: int, db: AsyncSession = Depends(get_db)):  
    db_room = await crud.get_room(db=db, room_id=room_id)
    if db_room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    booked_dates_data = await crud.get_booked_dates_for_room(db, room_id=room_id)
    booked_dates = [schemas.BookedDateRange.model_validate(b) for b in booked_dates_data]
    return booked_dates