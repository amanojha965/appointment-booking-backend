import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

const emptyForm = { name: '', description: '', duration: 30, price: 0, category: 'General', icon: '🏥' };
const icons = ['🏥','💆','💇','🦷','👁️','🏋️','💊','🩺','🧘','💅','✂️','🔬'];

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    API.get('/services').then(res => setServices(res.data.services)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (svc) => { setEditing(svc); setForm({ name: svc.name, description: svc.description, duration: svc.duration, price: svc.price, category: svc.category, icon: svc.icon }); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/services/${editing._id}`, form);
        toast.success('Service updated!');
      } else {
        await API.post('/services', form);
        toast.success('Service created!');
      }
      setModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deactivated');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-1">{services.length} active services</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-40 rounded-2xl"/>)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
            <div key={svc._id} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{svc.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-gray-900 truncate">{svc.name}</p>
                  <p className="text-xs text-primary-600 font-semibold">{svc.category}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{svc.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>⏱ {svc.duration}min</span>
                  <span className="font-semibold text-gray-700">₹{svc.price}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"><FiEdit2 className="text-sm"/></button>
                  <button onClick={() => handleDelete(svc._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><FiTrash2 className="text-sm"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-xl text-gray-900">{editing ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiX className="text-gray-500"/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {icons.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm({...form, icon: ic})}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${form.icon === ic ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >{ic}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Name *</label>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. General Checkup" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the service..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (min)</label>
                  <input type="number" min={15} className="input-field" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹)</label>
                  <input type="number" min={0} className="input-field" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <input className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="General" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.description} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <FiSave />}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
