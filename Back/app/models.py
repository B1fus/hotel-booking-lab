from sqlalchemy import (
    Column, Integer, String, Text, Numeric, ForeignKey, DateTime, Date,
    Boolean, CheckConstraint, func, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    price_per_night = Column(Numeric(10, 2), nullable=False)
    capacity = Column(Integer, nullable=False)
    bed_type = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    images = relationship("RoomImage", back_populates="room", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="room")

    __table_args__ = (
        CheckConstraint('price_per_night > 0', name='chk_room_price'),
        CheckConstraint('capacity > 0', name='chk_room_capacity'),
        Index('idx_rooms_price', 'price_per_night'),
        Index('idx_rooms_capacity', 'capacity'),
    )


class RoomImage(Base):
    __tablename__ = "room_images"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    caption = Column(String(255))

    room = relationship("Room", back_populates="images")


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    guest_name = Column(String(150), nullable=False)
    guest_email = Column(String(150))
    guest_phone = Column(String(50))
    num_adults = Column(Integer, nullable=False)
    num_children = Column(Integer, nullable=False, default=0)
    total_price = Column(Numeric(12, 2))
    booking_date = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="bookings")

    __table_args__ = (
        CheckConstraint('check_out_date > check_in_date', name='chk_booking_dates'),
        CheckConstraint('num_adults >= 0', name='chk_booking_adults'),
        CheckConstraint('num_children >= 0', name='chk_booking_children'),
        CheckConstraint('num_adults + num_children > 0', name='chk_booking_guests_total'),
        Index('idx_bookings_room_id_dates', 'room_id', 'check_in_date', 'check_out_date'),
        Index('idx_bookings_dates', 'check_in_date', 'check_out_date'),
    )