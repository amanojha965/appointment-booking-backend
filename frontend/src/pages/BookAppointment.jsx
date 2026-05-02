import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { FiClock, FiDollarSign, FiCalendar, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

export default function BookAppointment() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: date, 2: slot, 3: confirm

  // Generate next 14 weekdays
  const dates = [];
  let d = new Date();
  while (dates.length < 14) {
    d = addDays(d, 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(new Date(d));
  }

  useEffect(() => {
    API.get(`/services/${serviceId}`)
      .then(res => setService(res.data.service))
      .catch(() => { toast.error('Service not found'); navigate('/services'); });
  }, [serviceId]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    API.get(`/timeslots?date=${format(selectedDate, 'yyyy-MM-dd')}&serviceId=${serviceId}`)
      .then(res => setSlots(res.data.slots))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const handleBook = async () => {
    setLoading(true);
    try {
      await API.post('/appointments', { serviceId, timeSlotId: selectedSlot._id, notes });
      toast.success('Appointment booked successfully! 🎉');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!service) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/services')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <FiArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-500 text-sm">Fill in the details below</p>
        </div>
      </div>

      {/* Service card */}
      <div className="card bg-primary-50 border-primary-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">{service.icon}</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.description}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary-700 text-lg">₹{service.price}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1"><FiClock />{service.duration} min</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
            <span className={`text-xs font-medium ${step >= s ? 'text-primary-600' : 'text-gray-400'}`}>
              {s === 1 ? 'Date' : s === 2 ? 'Time Slot' : 'Confirm'}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Date */}
      {step === 1 && (
        <div className="card">
          <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2"><FiCalendar className="text-primary-600" />Select Date</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {dates.map(date => {
              const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              return (
                <button key={date.toISOString()} onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-xl border text-center transition-all duration-150 ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700'}`}
                >
                  <p className="text-xs font-medium opacity-70">{format(date, 'EEE')}</p>
                  <p className="text-lg font-bold">{format(date, 'd')}</p>
                  <p className="text-xs opacity-70">{format(date, 'MMM')}</p>
                </button>
              );
            })}
          </div>
          <button disabled={!selectedDate} onClick={() => setStep(2)} className="btn-primary w-full mt-4">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Slot */}
      {step === 2 && (
        <div className="card">
          <h3 className="font-display font-bold text-gray-900 mb-1 flex items-center gap-2"><FiClock className="text-primary-600" />Select Time Slot</h3>
          <p className="text-sm text-gray-400 mb-4">{format(selectedDate, 'EEEE, MMMM do')}</p>
          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">😔</p>
              <p className="text-gray-500 text-sm">No slots available for this date</p>
              <button onClick={() => setStep(1)} className="text-primary-600 text-sm font-semibold mt-2 hover:underline">Pick another date</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(slot => {
                const isSelected = selectedSlot?._id === slot._id;
                return (
                  <button key={slot._id} onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-center transition-all duration-150 ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 hover:border-primary-400 text-gray-700'}`}
                  >
                    <p className="text-sm font-semibold">{slot.startTime}</p>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>{slot.endTime}</p>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
            <button disabled={!selectedSlot} onClick={() => setStep(3)} className="btn-primary flex-1">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card">
          <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2"><FiCheckCircle className="text-green-500" />Confirm Booking</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="font-semibold">{service.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-semibold">{format(selectedDate, 'MMMM do, yyyy')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-semibold">{selectedSlot?.startTime} – {selectedSlot?.endTime}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Duration</span><span className="font-semibold">{service.duration} minutes</span></div>
            <div className="border-t border-gray-200 pt-3 flex justify-between"><span className="font-semibold text-gray-700">Total</span><span className="font-bold text-primary-600 text-lg">₹{service.price}</span></div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Any special requests or notes..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
            <button onClick={handleBook} disabled={loading} className="btn-primary flex-1">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Booking...</span> : '✓ Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
