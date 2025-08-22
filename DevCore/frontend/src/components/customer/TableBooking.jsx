// frontend/src/components/customer/TableBooking.js
import { useState } from 'react';

const TableBooking = () => {
  const [booking, setBooking] = useState({
    date: '',
    time: '',
    guests: 1,
    specialRequests: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Table booking logic here
    alert('Table booking feature coming soon!');
  };

  return (
    <div className="container py-4">
      <h2><i className="fas fa-chair me-2"></i>Table Booking</h2>
      
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={booking.date}
                    onChange={(e) => setBooking({...booking, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Time</label>
                  <select
                    className="form-select"
                    value={booking.time}
                    onChange={(e) => setBooking({...booking, time: e.target.value})}
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Number of Guests</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="10"
                    value={booking.guests}
                    onChange={(e) => setBooking({...booking, guests: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Special Requests</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={booking.specialRequests}
                    onChange={(e) => setBooking({...booking, specialRequests: e.target.value})}
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-100">
                  Book Table
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TableBooking;