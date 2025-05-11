from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_, or_, not_
from typing import List, Optional
from datetime import date

from . import models, schemas
from .core.security import get_password_hash


async def get_admin_user_by_username(db: AsyncSession, username: str) -> Optional[models.AdminUser]:
    result = await db.execute(select(models.AdminUser).filter(models.AdminUser.username == username))
    return result.scalars().first()

async def create_admin_user(db: AsyncSession, user: schemas.AdminUserCreate) -> models.AdminUser:
    hashed_password = get_password_hash(user.password)
    db_user = models.AdminUser(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_room(db: AsyncSession, room_id: int) -> Optional[models.Room]:
    result = await db.execute(
        select(models.Room)
        .options(selectinload(models.Room.images)) 
        .filter(models.Room.id == room_id)
    )
    return result.scalars().first()

async def get_rooms(db: AsyncSession, filters: schemas.RoomFilterParams, skip: int = 0, limit: int = 100) -> List[models.Room]:
    query = select(models.Room).options(selectinload(models.Room.images)) 
    if filters.price_min is not None:
        query = query.filter(models.Room.price_per_night >= filters.price_min)
    if filters.price_max is not None:
        query = query.filter(models.Room.price_per_night <= filters.price_max)
    if filters.capacity_min is not None:
        query = query.filter(models.Room.capacity >= filters.capacity_min)
    if filters.bed_type:
        query = query.filter(models.Room.bed_type.ilike(f"%{filters.bed_type}%"))

    if filters.check_in_date and filters.check_out_date:
        subquery_booked_ids = select(models.Booking.room_id)\
            .filter(
                models.Booking.check_in_date < filters.check_out_date,
                models.Booking.check_out_date > filters.check_in_date
            )\
            .distinct()
        query = query.filter(models.Room.id.notin_(subquery_booked_ids))

    query = query.offset(skip).limit(limit).order_by(models.Room.id) 
    result = await db.execute(query)
    return result.scalars().all()


async def get_bookings_for_room_and_dates(db: AsyncSession, room_id: int, check_in: date, check_out: date) -> List[models.Booking]:
    query = select(models.Booking).filter(
        models.Booking.room_id == room_id,
        models.Booking.check_in_date < check_out,
        models.Booking.check_out_date > check_in
    )
    result = await db.execute(query)
    return result.scalars().all()

async def create_booking(db: AsyncSession, booking: schemas.BookingCreate, room: models.Room) -> models.Booking:
    num_nights = (booking.check_out_date - booking.check_in_date).days
    total_price = room.price_per_night * num_nights

    db_booking = models.Booking(
        **booking.model_dump(), 
        total_price=total_price
    )
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

async def get_all_bookings(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[models.Booking]:
    query = select(models.Booking).offset(skip).limit(limit).order_by(models.Booking.booking_date.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def get_booking(db: AsyncSession, booking_id: int) -> Optional[models.Booking]:
    result = await db.execute(select(models.Booking).filter(models.Booking.id == booking_id))
    return result.scalars().first()

async def add_room_image(db: AsyncSession, room_id: int, image_data: schemas.RoomImageCreate) -> models.RoomImage:
    db_image = models.RoomImage(**image_data.model_dump(), room_id=room_id)
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image

async def get_booked_dates_for_room(db: AsyncSession, room_id: int) -> List[models.Booking]:
    today = date.today()
    query = select(models.Booking.check_in_date, models.Booking.check_out_date)\
            .filter(models.Booking.room_id == room_id)\
            .filter(models.Booking.check_out_date >= today) 
    result = await db.execute(query)    
    return result.mappings().all() 