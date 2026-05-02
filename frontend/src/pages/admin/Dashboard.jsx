import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { format } from 'date-fns';
import { FiUsers, FiGrid, FiCalendar, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

const statusBadge = (status) => {
  const map = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled', rejected:'badge-rejected' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_,i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  );

  const { stats, recentAppointments, weeklyData } = data;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'bg-blue-50', iconColor: 'text-blue-600', border: 'border-blue-100' },
    { label: 'Total Services', value: stats.totalServices, icon: FiGrid, color: 'bg-purple-50', iconColor: 'text-purple-600', border: 'border-purple-100' },
    { label: 'Total Bookings', value: stats.totalAppointments, icon: FiCalendar, color: 'bg-indigo-50', iconColor: 'text-indigo-600', border: 'border-indigo-100' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'bg-green-50', iconColor: 'text-green-600', border: 'border-green-100' },
    { label: "Today's Bookings", value: stats.todayAppointments, icon: FiTrendingUp, color: 'bg-orange-50', iconColor: 'text-orange-600', border: 'border-orange-100' },
    { label: 'Pending', value: stats.pendingAppointments, icon: FiClock, color: 'bg-yellow-50', iconColor: 'text-yellow-600', border: 'border-yellow-100' },
    { label: 'Confirmed', value: stats.confirmedAppointments, icon: FiCheckCircle, color: 'bg-teal-50', iconColor: 'text-teal-600', border: 'border-teal-100' },
    { label: 'Cancelled', value: stats.cancelledAppointments, icon: FiXCircle, color: 'bg-red-50', iconColor: 'text-red-500', border: 'border-red-100' },
  ];

  // Simple bar chart
  const maxCount = Math.max(...(weeklyData.map(d => d.count)), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, iconColor, border }) => (
          <div key={label} className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`text-lg ${iconColor}`} />
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly chart */}
        <div className="card">
          <h3 className="font-display font-bold text-gray-900 mb-4">Weekly Bookings</h3>
          {weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-36">
              {weeklyData.map(d => (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600">{d.count}</span>
                  <div
                    className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                    style={{ height: `${Math.max((d.count / maxCount) * 100, 8)}%` }}
                  />
                  <span className="text-xs text-gray-400">{format(new Date(d._id), 'dd/MM')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="card">
          <h3 className="font-display font-bold text-gray-900 mb-4">Appointment Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats.pendingAppointments, color: 'bg-yellow-400' },
              { label: 'Confirmed', value: stats.confirmedAppointments, color: 'bg-blue-500' },
              { label: 'Completed', value: stats.completedAppointments, color: 'bg-green-500' },
              { label: 'Cancelled', value: stats.cancelledAppointments, color: 'bg-red-400' },
            ].map(({ label, value, color }) => {
              const pct = stats.totalAppointments ? Math.round((value / stats.totalAppointments) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="text-gray-400 font-semibold">{value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent appointments */}
      <div className="card">
        <h3 className="font-display font-bold text-gray-900 mb-4">Recent Bookings</h3>
        {recentAppointments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAppointments.map(appt => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                          {appt.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{appt.userId?.name}</p>
                          <p className="text-xs text-gray-400">{appt.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5">
                        <span>{appt.serviceId?.icon}</span>
                        <span className="text-gray-700">{appt.serviceId?.name}</span>
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{format(new Date(appt.date), 'MMM dd')} · {appt.startTime}</td>
                    <td className="py-3">{statusBadge(appt.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
