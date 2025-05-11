import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { Booking } from '../models';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../api';
import { useAuth } from '../hooks/useAuth'; 

const AdminPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedBookings = await api.getAdminBookings();
        setBookings(fetchedBookings);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []); 

   const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString; 
        }
    }


  return (
    <div className="container mt-4">
      <h2>Забронированные номера</h2>
      <hr/>

      {isLoading && <LoadingSpinner />}
      <ErrorMessage message={error} />

      {!isLoading && !error && (
         <div className="table-responsive">
            <table className="table table-striped table-hover table-sm">
               <thead className="table-dark">
                 <tr>
                   <th>ID</th>
                   <th>Room ID</th>
                   <th>Guest Name</th>
                   <th>Check-in</th>
                   <th>Check-out</th>
                   <th>Adults</th>
                   <th>Children</th>
                   <th>Total Price</th>
                   <th>Booked On</th>
                   <th>Contact</th>
                 </tr>
               </thead>
               <tbody>
                 {bookings.length > 0 ? (
                   bookings.map(booking => (
                     <tr key={booking.id}>
                       <td>{booking.id}</td>
                       <td>{booking.room_id}</td>
                       <td>{booking.guest_name}</td>
                       <td>{formatDate(booking.check_in_date)}</td>
                       <td>{formatDate(booking.check_out_date)}</td>
                       <td>{booking.num_adults}</td>
                       <td>{booking.num_children}</td>
                       <td>${booking.total_price?.toFixed(2) ?? 'N/A'}</td>
                       <td>{formatDate(booking.booking_date)}</td>
                       <td>{booking.guest_email || booking.guest_phone || 'N/A'}</td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={10} className="text-center text-muted">Не найдены брони</td>
                   </tr>
                 )}
               </tbody>
            </table>
         </div>
      )}
    </div>
  );
};

export default AdminPage;