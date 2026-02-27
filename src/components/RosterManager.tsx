import { useState, useMemo, useEffect } from 'react';
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
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const WWE_CHAMPIONSHIPS = [
  'None',
  'World Heavyweight Championship',
  'Undisputed WWE Championship',
  'Intercontinental Championship',
  'United States Championship',
  'WWE Women\'s Championship',
  'Women\'s World Championship',
  'NXT Championship',
  'NXT Women\'s Championship',
  'NXT North American Championship',
  'NXT Women\'s North American Championship',
  'World Tag Team Championship',
  'WWE Tag Team Championship',
  'NXT Tag Team Championship',
  'WWE Women\'s Tag Team Championship',
  'WWE Speed Championship',
  'NXT Heritage Cup'
];

const RosterWrestlerImage = ({ wrestler }: { wrestler: Wrestler }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-900 border-b border-gray-800">
      {wrestler.image_url && !imageError ? (
        <img
          src={wrestler.image_url}
          alt={wrestler.name}
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-950 p-6 text-center">
          <span className="text-5xl font-black text-gray-800 uppercase tracking-tighter opacity-40 select-none group-hover:opacity-60 transition-opacity">
            {wrestler.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}
    </div>
  );
};

export function RosterManager() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [alignmentFilter, setAlignmentFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const saved = localStorage.getItem('wwe_roster');
    if (saved) {
      setWrestlers(JSON.parse(saved));
    } else {
      setWrestlers(rosterData);
    }
    setLoading(false);
  }, []);

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
      const matchesSearch = w.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesBrand = brandFilter === 'All' || w.brand === brandFilter;
      const matchesAlignment = alignmentFilter === 'All' || w.alignment === alignmentFilter;
      return matchesSearch && matchesBrand && matchesAlignment;
    });
  }, [wrestlers, debouncedSearch, brandFilter, alignmentFilter]);

  const saveRoster = (newRoster: Wrestler[]) => {
    setWrestlers(newRoster);
    localStorage.setItem('wwe_roster', JSON.stringify(newRoster));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();

    if (editingId) {
      const updated = wrestlers.map(w => w.id === editingId ? {
        ...w,
        ...formData,
        updated_at: now
      } : w);
      saveRoster(updated);
    } else {
      const nuevo: Wrestler = {
        id: crypto.randomUUID(),
        ...formData,
        created_at: now,
        updated_at: now
      };
      saveRoster([...wrestlers, nuevo]);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to remove this wrestler?')) {
      saveRoster(wrestlers.filter(w => w.id !== id));
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
            <h2 className="text-2xl font-black text-white uppercase tracking-wider italic">Roster Control</h2>
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
          <select
            value={alignmentFilter}
            onChange={(e) => setAlignmentFilter(e.target.value)}
            className="bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="All">All Aligns</option>
            <option value="Face">Face</option>
            <option value="Heel">Heel</option>
            <option value="Tweener">Tweener</option>
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
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest pl-1">Championship</label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value === 'None' ? '' : e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-red-600 outline-none"
              >
                <option value="None">No Championship</option>
                {WWE_CHAMPIONSHIPS.filter(t => t !== 'None').map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWrestlers.map((wrestler) => (
              <div
                key={wrestler.id}
                className="group relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/10"
              >
                <RosterWrestlerImage wrestler={wrestler} />

                {/* Overlay Gradients */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => startEdit(wrestler)}
                    className="p-2 bg-gray-900/90 backdrop-blur-md text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-gray-700 shadow-xl"
                    title="Edit Superstar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const nextTitle = WWE_CHAMPIONSHIPS[(WWE_CHAMPIONSHIPS.indexOf(wrestler.title || 'None') + 1) % WWE_CHAMPIONSHIPS.length];
                      const finalTitle = nextTitle === 'None' ? null : nextTitle;
                      saveRoster(wrestlers.map(w => w.id === wrestler.id ? { ...w, title: finalTitle } : w));
                    }}
                    className="p-2 bg-gray-900/90 backdrop-blur-md text-yellow-500 hover:text-white hover:bg-yellow-600 rounded-lg transition-all border border-gray-700 shadow-xl"
                    title="Cycle Championship"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(wrestler.id)}
                    className="p-2 bg-gray-900/90 backdrop-blur-md text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-all border border-gray-700 shadow-xl"
                    title="Release Superstar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getAlignmentColor(wrestler.alignment)}`}>
                      {wrestler.alignment}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${getBrandBadge(wrestler.brand)}`}>
                      {wrestler.brand}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-red-50 transition-colors">
                    {wrestler.name}
                  </h3>
                  {wrestler.title && (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Award className="w-3 h-3 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{wrestler.title}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredWrestlers.length === 0 && (
            <div className="text-center py-32 bg-gray-800/10 rounded-3xl border border-gray-700/50 border-dashed">
              <Users className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">No Superstars Found</h3>
              <p className="text-gray-500 mt-2 font-medium">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
