import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiSearch, FiUsers, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [toggling, setToggling] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    const q = search ? `&search=${encodeURIComponent(search)}` : '';
    API.get(`/admin/users?page=${page}&limit=10${q}`)
      .then(res => { setUsers(res.data.users); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [search, page]);

  const handleToggle = async (user) => {
    setToggling(user._id);
    try {
      const { data } = await API.put(`/admin/users/${user._id}/toggle`);
      toast.success(data.message);
      fetchUsers();
    } catch {
      toast.error('Failed to update');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} registered users</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name or email..."
          className="input-field pl-10"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl"/>)}</div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {['User','Phone','Joined','Bookings','Status','Action'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                    <FiUsers className="text-3xl mx-auto mb-2 text-gray-300"/>
                    No users found
                  </td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {u.appointmentCount || 0} bookings
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(u)} disabled={toggling === u._id}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      >
                        {u.isActive ? <><FiToggleRight /> Deactivate</> : <><FiToggleLeft /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
