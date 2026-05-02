import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiShield } from 'react-icons/fi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await API.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar section */}
      <div className="card text-center">
        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="font-display font-bold text-xl text-gray-900">{user?.name}</h2>
        <p className="text-gray-500 text-sm">{user?.email}</p>
        <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          <FiShield className="text-xs" />
          {user?.role === 'admin' ? 'Administrator' : 'User'}
        </span>
      </div>

      {/* Info card */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-gray-900">Personal Information</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors font-semibold">
              <FiEdit2 className="text-xs" /> Edit
            </button>
          ) : (
            <button onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors font-semibold">
              <FiX className="text-xs" /> Cancel
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            {editing ? (
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" className="input-field pl-10" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-3 bg-gray-50 rounded-xl">
                <FiUser className="text-gray-400" /> {user?.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2.5 px-3 bg-gray-50 rounded-xl">
              <FiMail className="text-gray-400" /> {user?.email}
              <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Cannot change</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
            {editing ? (
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="tel" className="input-field pl-10" placeholder="+91 00000 00000" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-3 bg-gray-50 rounded-xl">
                <FiPhone className="text-gray-400" /> {user?.phone || <span className="text-gray-400 font-normal">Not provided</span>}
              </div>
            )}
          </div>
        </div>

        {editing && (
          <button onClick={handleSave} disabled={loading} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Account info */}
      <div className="card">
        <h3 className="font-display font-bold text-gray-900 mb-4">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Member since</span>
            <span className="font-semibold text-gray-800">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Account status</span>
            <span className="badge-confirmed">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
