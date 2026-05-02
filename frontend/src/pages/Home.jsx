import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { FiCalendar, FiClock, FiGrid, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const statusBadge = (status) => {
  const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled', rejected: 'badge-rejected' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

export default function Home() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/appointments?limit=5'),
      API.get('/services')
    ]).then(([apptRes, svcRes]) => {
      setAppointments(apptRes.data.appointments);
      setServices(svcRes.data.services.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Bookings', value: appointments.length, icon: FiCalendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, icon: FiCheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: FiClock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Services', value: services.length, icon: FiGrid, color: 'bg-purple-50 text-purple-600' },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 bg-gray-200 rounded-2xl"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl"/>)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-in-out]">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12"/>
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-8"/>
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},</p>
          <h2 className="text-2xl font-display font-bold mt-1">{user?.name} 👋</h2>
          <p className="text-primary-100 text-sm mt-1">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
          <Link to="/services" className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors">
            Book Appointment <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="text-base" />
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-900">Recent Appointments</h3>
            <Link to="/appointments" className="text-primary-600 text-xs font-semibold hover:underline flex items-center gap-1">View all <FiArrowRight/></Link>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="text-gray-300 text-4xl mx-auto mb-2"/>
              <p className="text-gray-400 text-sm">No appointments yet</p>
              <Link to="/services" className="text-primary-600 text-sm font-semibold hover:underline">Book your first one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map(appt => (
                <div key={appt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {appt.serviceId?.icon || '🏥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{appt.serviceId?.name}</p>
                    <p className="text-xs text-gray-400">{format(new Date(appt.date), 'MMM dd')} · {appt.startTime}</p>
                  </div>
                  {statusBadge(appt.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available services */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-900">Our Services</h3>
            <Link to="/services" className="text-primary-600 text-xs font-semibold hover:underline flex items-center gap-1">All services <FiArrowRight/></Link>
          </div>
          <div className="space-y-3">
            {services.map(svc => (
              <div key={svc._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                <div className="w-9 h-9 bg-accent-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {svc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{svc.name}</p>
                  <p className="text-xs text-gray-400">{svc.duration} min · ₹{svc.price}</p>
                </div>
                <Link to={`/book/${svc._id}`}
                  className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors opacity-0 group-hover:opacity-100">
                  Book
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
