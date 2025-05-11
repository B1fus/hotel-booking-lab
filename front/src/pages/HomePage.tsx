import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import * as api from '../api';
import { Room, RoomFilterParams } from '../models';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../api';

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => resolve(func(...args)), waitFor);
        });
};


const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoomFilterParams>({
      price_min: undefined, 
      price_max: undefined,
      capacity_min: 1, 
      bed_type: '',
      check_in_date: '',
      check_out_date: '',
  });
   const [filterError, setFilterError] = useState<string | null>(null);

   
   
   const debouncedFetchRooms = useCallback(
       debounce(async (currentFilters: RoomFilterParams) => {
           setIsLoading(true);
           setError(null);
           setFilterError(null); 

           
            if ((currentFilters.check_in_date && !currentFilters.check_out_date) || (!currentFilters.check_in_date && currentFilters.check_out_date)) {
               setFilterError("Проверьте дату выезда и въезда");
               setIsLoading(false);
               setRooms([]); 
               return;
            }
            if (currentFilters.check_in_date && currentFilters.check_out_date && new Date(currentFilters.check_out_date) <= new Date(currentFilters.check_in_date)) {
                setFilterError("Выезд должен быть позже чем въезд");
                setIsLoading(false);
                setRooms([]); 
                return;
            }


           try {
               const fetchedRooms = await api.getRooms(currentFilters);
               setRooms(fetchedRooms);
           } catch (err) {
               setError(getApiErrorMessage(err));
               setRooms([]); 
           } finally {
               setIsLoading(false);
           }
       }, 500), 
       [] 
   );


  
  useEffect(() => {
      debouncedFetchRooms(filters);
  }, [filters, debouncedFetchRooms]); 

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFilters(prevFilters => ({
          ...prevFilters,
          [name]: type === 'number'
                   ? (value === '' ? undefined : parseFloat(value))
                   : value
      }));
  };


  return (
    <div className="container mt-4">
      <h2>Комнаты</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Поиск</h5>
          <form className="row g-3 align-items-end">
             <div className="col-md-3">
                <label htmlFor="price_min" className="form-label form-label-sm">Мин. цена (руб.)</label>
                <input type="number" className="form-control form-control-sm" id="price_min" name="price_min" value={filters.price_min ?? ''} onChange={handleFilterChange} min="0" placeholder="Любая" />
             </div>
              <div className="col-md-3">
                 <label htmlFor="price_max" className="form-label form-label-sm">Макс. цена (руб.)</label>
                 <input type="number" className="form-control form-control-sm" id="price_max" name="price_max" value={filters.price_max ?? ''} onChange={handleFilterChange} min="0" placeholder="Любая" />
             </div>
             <div className="col-md-2">
                 <label htmlFor="capacity_min" className="form-label form-label-sm">Мин. гостей</label>
                 <input type="number" className="form-control form-control-sm" id="capacity_min" name="capacity_min" value={filters.capacity_min ?? ''} onChange={handleFilterChange} min="1" placeholder="1" />
             </div>
             <div className="col-md-4">
                 <label htmlFor="bed_type" className="form-label form-label-sm">Тип кровати</label>
                 <input type="text" className="form-control form-control-sm" id="bed_type" name="bed_type" value={filters.bed_type ?? ''} onChange={handleFilterChange} placeholder="напр. двуспальная" />
             </div>
              <div className="col-md-3">
                 <label htmlFor="check_in_date" className="form-label form-label-sm">Въезд</label>
                 <input type="date" className="form-control form-control-sm" id="check_in_date" name="check_in_date" value={filters.check_in_date ?? ''} onChange={handleFilterChange} />
              </div>
               <div className="col-md-3">
                 <label htmlFor="check_out_date" className="form-label form-label-sm">Выезд</label>
                 <input type="date" className="form-control form-control-sm" id="check_out_date" name="check_out_date" value={filters.check_out_date ?? ''} onChange={handleFilterChange} min={filters.check_in_date ?? undefined} />
             </div>
          </form>
           {filterError && <ErrorMessage message={filterError}/>}
        </div>
      </div>


      {/*rooms*/}
      {isLoading && <LoadingSpinner />}
      <ErrorMessage message={error} />

      {!isLoading && !error && (
         <div className="row">
            {rooms.length > 0 ? (
               rooms.map(room => <RoomCard key={room.id} room={room} />)
            ) : (
               <div className="col-12">
                   <p className="text-center text-muted">Нет комнат подходящих под критерии</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default HomePage;