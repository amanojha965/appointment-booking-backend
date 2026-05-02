import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { FiClock, FiDollarSign, FiSearch, FiArrowRight } from 'react-icons/fi';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/services')
      .then(res => setServices(res.data.services))
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Our Services</h1>
        <p className="text-gray-500 text-sm mt-1">Choose a service to book your appointment</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          className="input-field pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">No services found for "{search}"</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(svc => (
            <div key={svc._id} className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  {svc.icon || '🏥'}
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    {svc.category || 'General'}
                  </span>
                  <h3 className="font-display font-bold text-gray-900 mt-1">{svc.name}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed flex-1">{svc.description}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiClock className="text-gray-400" />
                    {svc.duration} min
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <FiDollarSign className="text-gray-400" />
                    ₹{svc.price}
                  </span>
                </div>
                <Link
                  to={`/book/${svc._id}`}
                  className="flex items-center gap-1 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl transition-colors"
                >
                  Book <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
