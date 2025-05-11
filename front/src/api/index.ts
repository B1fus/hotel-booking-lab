import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { Room, Booking, BookingCreate, RoomFilterParams, TokenResponse, AdminUser, BookedDateRange } from '../models';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = Cookies.get('authToken');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const getRooms = async (filters: RoomFilterParams): Promise<Room[]> => {
  try {
    const cleanedFilters: { [key: string]: any } = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            cleanedFilters[key] = value;
        }
    });
    const response = await apiClient.get<Room[]>('/rooms/', {
      params: cleanedFilters, 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    
    throw error;
  }
};


export const getRoomById = async (roomId: number | string): Promise<Room> => {
  try {
    const response = await apiClient.get<Room>(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching room ${roomId}:`, error);
    throw error;
  }
};


export const createBooking = async (bookingData: BookingCreate): Promise<Booking> => {
  try {
    const response = await apiClient.post<Booking>('/bookings/', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    
    throw error; 
  }
};


export const loginAdmin = async (username: string, password: string): Promise<TokenResponse> => {
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const response = await apiClient.post<TokenResponse>('/auth/token', params, {
             headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}




export const getAdminMe = async (): Promise<AdminUser> => {
    try {
        
        const response = await apiClient.get<AdminUser>('/admin/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin info:', error);
        throw error;
    }
};


export const getAdminBookings = async (skip: number = 0, limit: number = 100): Promise<Booking[]> => {
    try {
        const response = await apiClient.get<Booking[]>('/admin/bookings', {
            params: { skip, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        throw error;
    }
};


// extract error messages from Axios errors
export const getApiErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData && Array.isArray(responseData.detail)) {
             return responseData.detail.map((err: any) => `${err.loc ? err.loc.join('.')+': ' : ''}${err.msg}`).join(', ');
        }
        if (responseData && responseData.detail) {
            return responseData.detail;
        }
         if (responseData && responseData.message) {
            return responseData.message;
        }
        return error.message || 'An unknown API error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const getRoomBookedDates = async (roomId: number | string): Promise<BookedDateRange[]> => {
    try {
        const response = await apiClient.get<BookedDateRange[]>(`/rooms/${roomId}/booked-dates`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching booked dates for room ${roomId}:`, error);
        throw error;
    }
};


export default apiClient;