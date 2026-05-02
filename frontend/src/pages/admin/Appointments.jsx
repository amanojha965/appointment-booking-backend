import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiFilter, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';

const statusBadge = (status) => {
  const map = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled', rejected:'badge-rejected' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = () => {
    setLoading(true);
    const q = filter !== 'all' ? `&status=${filter}` : '';
    API.get(`/admin/appointments?page=${page}&limit=10${q}`)
      .then(res => { setAppointments(res.data.appointments); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [filter, page]);

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await API.put(`/admin/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">All Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} total appointments</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <FiFilter className="text-gray-400" />
        {filters.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}
          >{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-20 rounded-2xl"/>)}</div>
      ) : (
        <>
          <div className="overflow-x-auto card p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Customer','Service','Date & Time','Price','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No appointments found</td></tr>
                ) : appointments.map(appt => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                          {appt.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 whitespace-nowrap">{appt.userId?.name}</p>
                          <p className="text-xs text-gray-400">{appt.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-base">{appt.serviceId?.icon}</span>
                        <span className="text-gray-700 font-medium">{appt.serviceId?.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      <p>{format(new Date(appt.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-400">{appt.startTime} – {appt.endTime}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">₹{appt.totalPrice}</td>
                    <td className="px-5 py-4">{statusBadge(appt.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {appt.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(appt._id, 'confirmed')}
                              disabled={!!updating}
                              className="flex items-center gap-1 text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors font-semibold">
                              <FiCheck /> Confirm
                            </button>
                            <button onClick={() => updateStatus(appt._id, 'rejected')}
                              disabled={!!updating}
                              className="flex items-center gap-1 text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors font-semibold">
                              <FiX /> Reject
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <button onClick={() => updateStatus(appt._id, 'completed')}
                            disabled={!!updating}
                            className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors font-semibold">
                            <FiCheckCircle /> Complete
                          </button>
                        )}
                        {['pending','confirmed'].includes(appt.status) && (
                          <button onClick={() => updateStatus(appt._id, 'cancelled')}
                            disabled={!!updating}
                            className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p+1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
