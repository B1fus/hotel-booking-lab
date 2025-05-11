import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api';
import { Room, BookedDateRange } from '../models';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BookingWidget from '../components/BookingWidget';
import ImagePlaceholder from '../components/ImagePlaceholder';
import { getApiErrorMessage } from '../api';

const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError("Room ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedRoom, fetchedBookedDates] = await Promise.all([
          api.getRoomById(roomId),
          api.getRoomBookedDates(roomId)
        ]);
        setRoom(fetchedRoom);
        setBookedDates(fetchedBookedDates);
      } catch (err) {
        setError(`Failed to load room data: ${getApiErrorMessage(err)}`);
        setRoom(null);
        setBookedDates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  if (isLoading) return <div className="container mt-5 text-center"><LoadingSpinner /></div>;
  if (error) return <div className="container mt-5"><ErrorMessage message={error} /></div>;
  if (!room) return <div className="container mt-5"><p>Невозможно загрузить детали комнаты</p></div>;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <h2>{room.name}</h2>
          <p className="text-muted">
            Кол-во гостей: {room.capacity} | Кровать: {room.bed_type || 'N/A'} | Цена: {room.price_per_night.toFixed(2)} руб. / ночь
          </p>
          <hr />

          <p>{room.description || 'Описания нет'}</p>
          
          {room.images && room.images.length > 0 && (
              <div className="mt-4">
                  <h4>Фото комнаты</h4>
                  <div className="row image-gallery">
                      {room.images.map(img => (
                        <div key={img.id} className="col-md-6 mb-3 text-center">
                            <ImagePlaceholder
                                src={img.image_url}
                                alt={img.caption || room.name}
                                className="img-fluid rounded shadow-sm mb-3"
                                style={{ minHeight: '100px', maxHeight: '300px', objectFit: 'contain' }}
                            />
                            {img.caption && <p className="text-center small text-muted mt-1">{img.caption}</p>}
                        </div>
                      ))}
                  </div>
              </div>
            )}
            {(!room.images || room.images.length === 0) && <p>Нет фото для этой комнаты</p>}

        </div>

        <div className="col-lg-4">
          <BookingWidget
            roomId={room.id}
            roomCapacity={room.capacity}
            roomPricePerNight={room.price_per_night}
            bookedDates={bookedDates}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;