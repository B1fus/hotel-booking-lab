export interface RoomImage {
  id: number;
  room_id: number;
  image_url: string;
  caption?: string | null;
}

export interface Room {
  id: number;
  name: string;
  description?: string | null;
  price_per_night: number; 
  capacity: number;
  bed_type?: string | null;
  created_at: string; 
  updated_at: string; 
  images: RoomImage[];
}

export interface Booking {
  id: number;
  room_id: number;
  check_in_date: string; 
  check_out_date: string; 
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  num_adults: number;
  num_children: number;
  total_price?: number | null; 
  booking_date: string; 
  
  
}

export interface BookingCreate {
  room_id: number;
  check_in_date: string; 
  check_out_date: string; 
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  num_adults: number;
  num_children: number;
}

export interface RoomFilterParams {
  price_min?: number | null;
  price_max?: number | null;
  capacity_min?: number | null;
  bed_type?: string | null;
  check_in_date?: string | null; 
  check_out_date?: string | null; 
  skip?: number;
  limit?: number;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface AdminUser {
    id: number;
    username: string;
    created_at: string; 
}

export interface BookedDateRange {
  check_in_date: string;  
  check_out_date: string; 
}