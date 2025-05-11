from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing import List, Optional
from datetime import date, datetime
from fastapi import HTTPException, status


class RoomImageBase(BaseModel):
    image_url: str
    caption: Optional[str] = None

class BookingBase(BaseModel):
    room_id: int
    check_in_date: date
    check_out_date: date
    guest_name: str = Field(..., min_length=1, max_length=150)
    guest_email: Optional[EmailStr] = None
    guest_phone: Optional[str] = Field(None, max_length=50)
    num_adults: int = Field(..., gt=0) 
    num_children: int = Field(default=0, ge=0)

    @model_validator(mode='after')
    def check_dates(self) -> 'BookingBase':
        if self.check_in_date >= self.check_out_date:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Check-out date must be after check-in date"
            )
        return self

class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    price_per_night: float = Field(..., gt=0)
    capacity: int = Field(..., gt=0)
    bed_type: Optional[str] = Field(None, max_length=100)


# add a creating funcs
class RoomImageCreate(RoomImageBase):
    pass

class BookingCreate(BookingBase):
    pass 

class RoomCreate(RoomBase):
    pass


class RoomImage(RoomImageBase):
    id: int
    room_id: int

    class Config:
        from_attributes = True

class Booking(BookingBase):
    id: int
    total_price: Optional[float] = None
    booking_date: datetime
    
    class Config:
        from_attributes = True

class Room(RoomBase):
    id: int
    created_at: datetime
    updated_at: datetime
    images: List[RoomImage] = [] 

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminUserBase(BaseModel):
    username: str

class AdminUserCreate(AdminUserBase):
    password: str

class AdminUser(AdminUserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RoomFilterParams(BaseModel):
    price_min: Optional[float] = Field(None, ge=0)
    price_max: Optional[float] = None
    capacity_min: Optional[int] = Field(None, ge=1)
    bed_type: Optional[str] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None

    @model_validator(mode='after')
    def check_date_pair(self) -> 'RoomFilterParams':
        if self.check_in_date and self.check_out_date:
            if self.check_in_date >= self.check_out_date:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Check-out date must be after check-in date"
                )
        elif self.check_in_date or self.check_out_date:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Check-out date must be after check-in date"
            )
        return self
    
class BookedDateRange(BaseModel):
    check_in_date: date
    check_out_date: date

    class Config:
        from_attributes = True