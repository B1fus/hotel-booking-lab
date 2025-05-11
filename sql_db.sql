DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_images;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS admin_users;



CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL CHECK (price_per_night > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    bed_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_images (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(150),
    guest_phone VARCHAR(50),
    num_adults INTEGER NOT NULL CHECK (num_adults >= 0),
    num_children INTEGER NOT NULL CHECK (num_children >= 0),
    total_price DECIMAL(12, 2),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT chk_guests CHECK (num_adults > 0 OR num_children > 0)
);



CREATE INDEX idx_rooms_price ON rooms(price_per_night);
CREATE INDEX idx_rooms_capacity ON rooms(capacity);
CREATE INDEX idx_bookings_room_id_dates ON bookings(room_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_admin_users_username ON admin_users(username);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_room_modtime
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
