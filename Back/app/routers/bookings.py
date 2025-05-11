from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app import crud, schemas, models
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED, tags=["Bookings"])
async def create_booking(
    booking: schemas.BookingCreate,
    db: AsyncSession = Depends(get_db)
):
    room = await crud.get_room(db, room_id=booking.room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    total_guests = booking.num_adults + booking.num_children
    if total_guests > room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of guests ({total_guests}) exceeds room capacity ({room.capacity}). Consider booking an additional room or choosing a larger one."
        )

    existing_bookings = await crud.get_bookings_for_room_and_dates(
        db,
        room_id=booking.room_id,
        check_in=booking.check_in_date,
        check_out=booking.check_out_date
    )
    if existing_bookings:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The room is not available for the selected dates."
        )

    try:
        created_booking = await crud.create_booking(db=db, booking=booking, room=room)
        return created_booking
    except Exception as e:
        await db.rollback() 
        print(f"Error creating booking: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create booking due to an internal error."
        )

@router.get("/{booking_id}", response_model=schemas.Booking, tags=["Bookings"])
async def read_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    db_booking = await crud.get_booking(db, booking_id=booking_id)
    if db_booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return db_booking