import React from 'react';
import './RaidBooking.css';

export const RaidBooking: React.FC = () => {
  return (
    <div className="raid-booking">
      <div className="raid-booking__header">
        <h1 className="raid-booking__title">Raid Booking</h1>
        <p className="raid-booking__subtitle">
          Book clients for raid slots created by administrators
        </p>
      </div>

      <div className="raid-booking__content">
        <div className="raid-booking__empty">
          <div className="raid-booking__empty-icon">🗡️</div>
          <h2 className="raid-booking__empty-title">No Raid Slots Available</h2>
          <p className="raid-booking__empty-text">
            There are currently no raid slots available for booking. 
            Raid services can only be created by administrators.
          </p>
        </div>
      </div>
    </div>
  );
};