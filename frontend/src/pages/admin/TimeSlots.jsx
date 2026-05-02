import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiX } from 'react-icons/fi';

const defaultTimes = [
  { startTime: '09:00', endTime: '09:30' },
  { startTime: '09:30', endTime: '10:00' },
  { startTime: '10:00', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:00' },
  { startTime: '11:00', endTime: '11:30' },
  { startTime: '11:30', endTime: '12:00' },
  { startTime: '14:00', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:00' },
  { startTime: '15:00', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:00' },
  { startTime: '16:00', endTime: '16:30' },
  { startTime: '16:30', endTime: '17:00' },
];

export default function AdminTimeSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [modal, setModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [services, setServices] = useState([]);
  const [deleting, setDeleting] = useState(null);

  // Single slot form
  const [singleForm, setSingleForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '09:30', maxBookings: 1, serviceId: '' });

  // Bulk form
  const [bulkForm, setBulkForm] = useState({ startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'), serviceId: '', maxBookings: 1 });
  const [selectedTimes, setSelectedTimes] = useState(defaultTimes.map((_, i) => i));
  const [saving, setSaving] = useState(false);

  const fetchSlots = () => {
    setLoading(true);
    API.get(`/timeslots/all?date=${selectedDate}`)
      .then(res => setSlots(res.data.slots))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, [selectedDate]);
  useEffect(() => { API.get('/services').then(res => setServices(res.data.services)); }, []);

  const handleCreateSingle = async () => {
    setSaving(true);
    try {
      await API.post('/timeslots', { ...singleForm, serviceId: singleForm.serviceId || null });
      toast.success('Time slot created!');
      setModal(false);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkCreate = async () => {
    if (selectedTimes.length === 0) { toast.error('Select at least one time slot'); return; }
    setSaving(true);
    try {
      const times = selectedTimes.map(i => defaultTimes[i]);
      await API.post('/timeslots/bulk', { ...bulkForm, times, serviceId: bulkForm.serviceId || null });
      toast.success('Time slots created for the date range!');
      setBulkModal(false);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this time slot?')) return;
    setDeleting(id);
    try {
      await API.delete(`/timeslots/${id}`);
      toast.success('Slot deleted');
      fetchSlots();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Time Slots</h1>
          <p className="text-gray-500 text-sm mt-1">Manage availability slots</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBulkModal(true)} className="btn-secondary text-sm flex items-center gap-2">
            <FiCalendar /> Bulk Create
          </button>
          <button onClick={() => setModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <FiPlus /> Add Slot
          </button>
        </div>
      </div>

      {/* Date picker */}
      <div className="card flex items-center gap-3 p-4">
        <FiCalendar className="text-primary-600" />
        <label className="text-sm font-semibold text-gray-700">View date:</label>
        <input type="date" className="input-field max-w-xs" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)} />
        <span className="text-sm text-gray-500">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-20 rounded-xl"/>)}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16">
          <FiClock className="text-gray-300 text-5xl mx-auto mb-3"/>
          <p className="text-gray-500">No slots for {format(new Date(selectedDate + 'T00:00:00'), 'MMMM do, yyyy')}</p>
          <button onClick={() => setModal(true)} className="btn-primary mt-3 text-sm">Create First Slot</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {slots.map(slot => (
            <div key={slot._id} className={`relative group p-4 rounded-xl border transition-all ${slot.isAvailable && slot.currentBookings < slot.maxBookings ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <FiClock className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-red-500'}`}/>
                <button onClick={() => handleDelete(slot._id)} disabled={deleting === slot._id}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-lg transition-all text-red-400">
                  <FiTrash2 className="text-xs"/>
                </button>
              </div>
              <p className="font-bold text-gray-800">{slot.startTime}</p>
              <p className="text-xs text-gray-500">to {slot.endTime}</p>
              <p className="text-xs mt-1 font-medium">
                {slot.currentBookings}/{slot.maxBookings} booked
              </p>
              {slot.serviceId && <p className="text-xs text-primary-600 mt-1 truncate">{slot.serviceId?.name}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Single slot modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)}/>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-xl text-gray-900">New Time Slot</h3>
              <button onClick={() => setModal(false)}><FiX className="text-gray-500"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                <input type="date" className="input-field" value={singleForm.date} onChange={e => setSingleForm({...singleForm, date: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input type="time" className="input-field" value={singleForm.startTime} onChange={e => setSingleForm({...singleForm, startTime: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                  <input type="time" className="input-field" value={singleForm.endTime} onChange={e => setSingleForm({...singleForm, endTime: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Bookings</label>
                <input type="number" min={1} className="input-field" value={singleForm.maxBookings} onChange={e => setSingleForm({...singleForm, maxBookings: +e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service (optional)</label>
                <select className="input-field" value={singleForm.serviceId} onChange={e => setSingleForm({...singleForm, serviceId: e.target.value})}>
                  <option value="">All Services</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreateSingle} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating...' : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBulkModal(false)}/>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-xl text-gray-900">Bulk Create Slots</h3>
              <button onClick={() => setBulkModal(false)}><FiX className="text-gray-500"/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">From Date</label>
                  <input type="date" className="input-field" value={bulkForm.startDate} onChange={e => setBulkForm({...bulkForm, startDate: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">To Date</label>
                  <input type="date" className="input-field" value={bulkForm.endDate} onChange={e => setBulkForm({...bulkForm, endDate: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time Slots ({selectedTimes.length} selected)</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {defaultTimes.map((t, i) => (
                    <button key={i} type="button" onClick={() => setSelectedTimes(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all ${selectedTimes.includes(i) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-400'}`}
                    >{t.startTime} – {t.endTime}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Bookings/Slot</label>
                  <input type="number" min={1} className="input-field" value={bulkForm.maxBookings} onChange={e => setBulkForm({...bulkForm, maxBookings: +e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service (optional)</label>
                  <select className="input-field" value={bulkForm.serviceId} onChange={e => setBulkForm({...bulkForm, serviceId: e.target.value})}>
                    <option value="">All Services</option>
                    {services.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                💡 Weekends (Sat/Sun) will be automatically skipped.
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setBulkModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleBulkCreate} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating...' : `Create for ${format(new Date(bulkForm.startDate+'T00:00:00'),'MMM d')} – ${format(new Date(bulkForm.endDate+'T00:00:00'),'MMM d')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
