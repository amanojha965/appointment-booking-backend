import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiCalendar, FiClock, FiX, FiRefreshCw, FiFilter } from 'react-icons/fi';

const statusBadge = (status) => {
  const map = {
    pending: 'badge-pending', confirmed: 'badge-confirmed',
    completed: 'badge-completed', cancelled: 'badge-cancelled', rejected: 'badge-rejected'
  };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    const q = filter !== 'all' ? `?status=${filter}` : '';
    API.get(`/appointments${q}`)
      .then(res => setAppointments(res.data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await API.put(`/appointments/${cancelModal._id}/cancel`, { cancellationReason: reason });
      toast.success('Appointment cancelled');
      setCancelModal(null);
      setReason('');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/services" className="btn-primary text-sm">+ New Booking</Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <FiFilter className="text-gray-400 text-sm" />
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20">
          <FiCalendar className="text-gray-300 text-5xl mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No appointments found</p>
          <p className="text-gray-400 text-sm mt-1">Book a service to get started</p>
          <Link to="/services" className="btn-primary mt-4 inline-flex">Browse Services</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => (
            <div key={appt._id} className="card hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {appt.serviceId?.icon || '🏥'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-gray-900">{appt.serviceId?.name}</h3>
                    {statusBadge(appt.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiCalendar />{format(new Date(appt.date), 'MMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1"><FiClock />{appt.startTime} – {appt.endTime}</span>
                  </div>
                  {appt.notes && <p className="text-xs text-gray-400 mt-1 truncate">📝 {appt.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">₹{appt.totalPrice}</p>
                  {['pending', 'confirmed'].includes(appt.status) && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setCancelModal(appt)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                        <FiX /> Cancel
                      </button>
                      <Link to={`/book/${appt.serviceId?._id}`}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors">
                        <FiRefreshCw /> Reschedule
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              {appt.cancellationReason && (
                <div className="mt-3 p-2.5 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">Reason: {appt.cancellationReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-display font-bold text-gray-900 text-lg mb-1">Cancel Appointment</h3>
            <p className="text-gray-500 text-sm mb-4">Are you sure you want to cancel <strong>{cancelModal.serviceId?.name}</strong> on {format(new Date(cancelModal.date), 'MMM dd')} at {cancelModal.startTime}?</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason (optional)</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Why are you cancelling?"
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="btn-secondary flex-1">Keep it</button>
              <button onClick={handleCancel} disabled={actionLoading} className="btn-danger flex-1">
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
