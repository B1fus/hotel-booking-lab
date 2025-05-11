import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import { BookingCreate, BookedDateRange } from '../models';
import * as api from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { getApiErrorMessage } from '../api';
import DatePicker from './DatePicker';

interface BookingWidgetProps {
  roomId: number;
  roomCapacity: number;
  roomPricePerNight: number;
  bookedDates?: BookedDateRange[];
}

const BookingWidget: React.FC<BookingWidgetProps> = ({
    roomId,
    roomCapacity,
    roomPricePerNight,
    bookedDates = []
}) => {
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);

  const [numAdults, setNumAdults] = useState<number>(1);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generalValidationError, setGeneralValidationError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);

    const handleCheckInSelect = (date: string | null) => {
        setCheckInDate(date);
        setGeneralValidationError(null);
        setApiError(null);
        setSuccessMessage(null);

        if (date && checkOutDate && new Date(date) >= new Date(checkOutDate)) {
            setCheckOutDate(null);
        }
    };

    const handleCheckOutSelect = (date: string | null) => {
        setCheckOutDate(date);
         setGeneralValidationError(null);
         setApiError(null);
         setSuccessMessage(null);
    };


  const validateForm = useCallback((): boolean => {
        let isValid = true;
        setGeneralValidationError(null);
        setCapacityError(null);

        if (!checkInDate) {
            setGeneralValidationError('Проверьте дату въезда');
            isValid = false;
        }
        if (!checkOutDate) {
            setGeneralValidationError('Проверьте дату выезда.');
            isValid = false;
        }

        if (numAdults <= 0 && numChildren <= 0) {
            setGeneralValidationError('Как минимум один гость должен быть заселен');
            isValid = false;
        }
        if (!guestName.trim()) {
            setGeneralValidationError('Введите имя гостя.');
            isValid = false;
        }
         if (guestEmail && !/\S+@\S+\.\S+/.test(guestEmail)) {
             setGeneralValidationError('Введите валидный email');
             isValid = false;
         }

        const totalGuests = numAdults + numChildren;
        if (totalGuests > roomCapacity) {
            setCapacityError(`Слишком много гостей (${totalGuests}), макс. число (${roomCapacity}). Предлагаем вам забронировать другой номер с большим количеством мест.`);
            isValid = false;
        }

         return isValid;

    }, [checkInDate, checkOutDate, numAdults, numChildren, guestName, guestEmail, roomCapacity]);


   useEffect(() => {
       const totalGuests = numAdults + numChildren;
        if (totalGuests > roomCapacity) {
            setCapacityError(`Слишком много гостей (${totalGuests}), макс. число (${roomCapacity}). Предлагаем вам забронировать другой номер с большим количеством мест.`);
        } else {
             setCapacityError(null);
        }

       setApiError(null);
       setSuccessMessage(null);
    }, [numAdults, numChildren, roomCapacity]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setGeneralValidationError(null);
    setApiError(null);
    setSuccessMessage(null);

    switch (name) {
        case 'numAdults':
            setNumAdults(parseInt(value, 10) || 0);
            break;
        case 'numChildren':
            setNumChildren(parseInt(value, 10) || 0);
            break;
        case 'guestName': setGuestName(value); break;
        case 'guestEmail': setGuestEmail(value); break;
        case 'guestPhone': setGuestPhone(value); break;
        default:
            break;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      console.log("Form validation failed before submit.");
      return;
    }

     if (!checkInDate || !checkOutDate) {
         setGeneralValidationError("Check-in and Check-out dates are required.");
         return;
     }


    setIsLoading(true);

    const bookingData: BookingCreate = {
      room_id: roomId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      num_adults: numAdults,
      num_children: numChildren,
      guest_name: guestName,
      guest_email: guestEmail || null,
      guest_phone: guestPhone || null,
    };

    try {
      const createdBooking = await api.createBooking(bookingData);
      setSuccessMessage(`Booking successful! ID: ${createdBooking.id}. Confirmation sent to ${guestEmail || 'contact provided'}.`);
      handleCheckInSelect(null);
      handleCheckOutSelect(null);
      setNumAdults(1);
      setNumChildren(0);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');

    } catch (err) {
      const apiErrorMessage = getApiErrorMessage(err);
      setApiError(`Booking failed: ${apiErrorMessage}`);
      console.error("Booking Error Raw:", err);
    } finally {
      setIsLoading(false);
    }
  };
    const calculateTotalPrice = (): number | null => {
        if (checkInDate && checkOutDate && roomPricePerNight > 0) {
            const start = new Date(checkInDate);
            const end = new Date(checkOutDate);
            if (start && end && end > start) {
                 const diffTime = end.getTime() - start.getTime();
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 return diffDays * roomPricePerNight;
            }
        }
        return null;
    };
    const estimatedPrice = calculateTotalPrice();

   const isFormInvalid = !!generalValidationError || !!capacityError;


  return (
    <div className="card mt-4">
      <div className="card-header">
        <h4>Забронировать</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
             <div className="col-md-6">
                <DatePicker
                    id="checkInDate"
                    label="Въезд"
                    selectedDate={checkInDate}
                    onDateSelect={handleCheckInSelect}
                    bookedDates={bookedDates}
                    disabled={isLoading}
                 />
             </div>
             <div className="col-md-6">
                <DatePicker
                    id="checkOutDate"
                    label="Выезд"
                    selectedDate={checkOutDate}
                    onDateSelect={handleCheckOutSelect}
                    minDate={checkInDate ? (new Date(checkInDate)!.getTime() + 86400000).toString() : null}
                    bookedDates={bookedDates}
                    disabled={isLoading || !checkInDate}
                 />
             </div>
          </div>

          <div className="row g-3 mb-3">
              <div className="col-md-6">
                 <label htmlFor="numAdults" className="form-label">Кол-во взрослых</label>
                 <input
                     type="number"
                     className="form-control"
                     id="numAdults"
                     name="numAdults"
                     value={numAdults}
                     onChange={handleInputChange}
                     min="1"
                     required
                     disabled={isLoading}
                  />
              </div>
              <div className="col-md-6">
                  <label htmlFor="numChildren" className="form-label">Кол-во детей</label>
                   <input
                     type="number"
                     className="form-control"
                     id="numChildren"
                     name="numChildren"
                     value={numChildren}
                     onChange={handleInputChange}
                     min="0"
                     required
                     disabled={isLoading}
                  />
              </div>
               {capacityError &&
                  <div className="col-12 mt-1">
                      <div className="alert alert-warning small p-2" role="alert">
                          {capacityError}
                      </div>
                  </div>
              }
          </div>
          <div className="mb-3">
            <label htmlFor="guestName" className="form-label">ФИО</label>
            <input
              type="text"
              className="form-control"
              id="guestName"
              name="guestName"
              value={guestName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="row g-3 mb-3">
              <div className="col-md-6">
                 <label htmlFor="guestEmail" className="form-label">Email</label>
                 <input
                    type="email"
                    className="form-control"
                    id="guestEmail"
                    name="guestEmail"
                    value={guestEmail}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
              </div>
               <div className="col-md-6">
                   <label htmlFor="guestPhone" className="form-label">Номер телефона</label>
                   <input
                       type="tel"
                       className="form-control"
                       id="guestPhone"
                       name="guestPhone"
                       value={guestPhone}
                       onChange={handleInputChange}
                       disabled={isLoading}
                   />
               </div>
          </div>
            {estimatedPrice !== null && (
                <div className="alert alert-info small">
                    Итоговая цена: <strong>${estimatedPrice.toFixed(2)}</strong>
                    <br/>
                </div>
            )}
           {generalValidationError && <ErrorMessage message={generalValidationError} />}

           <ErrorMessage message={apiError} />
           {successMessage && <div className="alert alert-success">{successMessage}</div>}

           {isLoading ? (
               <LoadingSpinner />
           ) : (
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isLoading || isFormInvalid}
              >
              Забронировать
              </button>
           )}
        </form>
      </div>
    </div>
  );
};

export default BookingWidget;