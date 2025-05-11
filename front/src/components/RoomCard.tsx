import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Room } from '../models';
import ImagePlaceholder from './ImagePlaceholder';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const imageUrl = (room.images && room.images.length > 0) ? room.images[0].image_url : null;
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100">
        <Link to={`/rooms/${room.id}`}>
          <ImagePlaceholder
            src={imageUrl}
            alt={room.name}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">
              <Link to={`/rooms/${room.id}`} className="text-decoration-none text-dark">{room.name}</Link>
           </h5>
          <p className="card-text text-muted small">
            Кол-во гостей: {room.capacity} | Кровать: {room.bed_type || 'N/A'}
          </p>
           <p className="card-text mt-auto">
             <strong>{room.price_per_night.toFixed(2)}</strong> руб. / ночь
           </p>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;