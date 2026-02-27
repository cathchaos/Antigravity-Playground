import { useState, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Award, Search } from 'lucide-react';
import rosterData from '../data/roster.json';

interface Wrestler {
  id: string;
  name: string;
  brand: string;
  alignment: string;
  status: string;
  title?: string | null;
  bio?: string | null;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function RosterManager() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>(rosterData);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [alignmentFilter, setAlignmentFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'RAW',
    alignment: 'Face',
    status: 'Active',
    title: '',
    bio: '',
    image_url: '',
  });

  const filteredWrestlers = useMemo(() => {
    return wrestlers.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = brandFilter === 'All' || w.brand === brandFilter;
      const matchesAlignment = alignmentFilter === 'All' || w.alignment === alignmentFilter;
      return matchesSearch && matchesBrand && matchesAlignment;
    });
  }, [wrestlers, searchTerm, brandFilter, alignmentFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setWrestlers(prev => prev.map(w => w.id === editingId ? { ...w, ...formData, updated_at: new Date().toISOString() } : w));
    } else {
      const newWrestler = {
        ...formData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Wrestler;
      setWrestlers(prev => [newWrestler, ...prev]);
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to remove this wrestler?')) {
      setWrestlers(prev => prev.filter(w => w.id !== id));
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      brand: 'RAW',
      alignment: 'Face',
      status: 'Active',
      title: '',
      bio: '',
      image_url: '',
    });
    setIsAdding(false);
    setEditingId(null);
  }

  function startEdit(wrestler: Wrestler) {
    setFormData({
      name: wrestler.name,
      brand: wrestler.brand,
      alignment: wrestler.alignment,
      status: wrestler.status,
      title: wrestler.title || '',
      bio: wrestler.bio || '',
      image_url: wrestler.image_url || '',
    });
    setEditingId(wrestler.id);
    setIsAdding(true);
  }

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'Face': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Heel': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Tweener': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getBrandBadge = (brand: string) => {
    switch (brand) {
      case 'RAW': return 'text-red-500';
      case 'SmackDown': return 'text-blue-500';
      case 'NXT': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-xl border border-red-600/30">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">WWE Roster</h2>
            <p className="text-gray-400 text-sm">Managing {wrestlers.length} Superstars</p>
          </div>
        </div>

        <div className="flex flex-1 max-w-2xl gap-4 items-center w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Superstars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="All">All Brands</option>
            <option value="RAW">RAW</option>
            <option value="SmackDown">SmackDown</option>
            <option value="NXT">NXT</option>
          </select>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Name</label>
              <input
                type="text"
                placeholder="Superstar Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
              >
                <option value="RAW">RAW</option>
                <option value="SmackDown">SmackDown</option>
                <option value="NXT">NXT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Alignment</label>
              <select
                value={formData.alignment}
                onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
              >
                <option value="Face">Face</option>
                <option value="Heel">Heel</option>
                <option value="Tweener">Tweener</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Injured">Injured</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Title</label>
              <input
                type="text"
                placeholder="Current Championships"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/30 active:scale-95"
            >
              {editingId ? 'Update Superstar' : 'Add Superstar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWrestlers.map((wrestler) => (
          <div
            key={wrestler.id}
            className="group relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/10"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
              {wrestler.image_url ? (
                <img
                  src={wrestler.image_url}
                  alt={wrestler.name}
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://www.thesmackdownhotel.com/images/roster/placeholder.jpg';
                    (e.target as HTMLImageElement).onerror = () => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=' + encodeURIComponent(wrestler.name);
                    };
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <Users className="w-20 h-20 opacity-20" />
                </div>
              )}

              {/* Overlay Gradients */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => startEdit(wrestler)}
                  className="p-2 bg-gray-900/90 backdrop-blur-md text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-gray-700 shadow-xl"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(wrestler.id)}
                  className="p-2 bg-gray-900/90 backdrop-blur-md text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-all border border-gray-700 shadow-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {wrestler.status !== 'Active' && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-red-500/50 shadow-lg">
                    {wrestler.status}
                  </span>
                </div>
              )}

              {/* Card Footer Info (Bottom) */}
              <div className="absolute inset-x-0 bottom-0 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getAlignmentColor(wrestler.alignment)}`}>
                    {wrestler.alignment}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${getBrandBadge(wrestler.brand)}`}>
                    {wrestler.brand}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-red-50 transition-colors">
                  {wrestler.name}
                </h3>

                {wrestler.title && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{wrestler.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWrestlers.length === 0 && (
        <div className="text-center py-32 bg-gray-800/10 rounded-3xl border border-gray-700/50 border-dashed">
          <Users className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">No Superstars Found</h3>
          <p className="text-gray-500 mt-2 font-medium">Try adjusting your searching or filtering criteria</p>
        </div>
      )}
    </div>
  );
}
