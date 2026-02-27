import { useState, useMemo, useEffect } from 'react';
import { Zap, Plus, Trash2, Flame, Search, Lightbulb } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Wrestler = Database['public']['Tables']['wrestlers']['Row'];
type Feud = Database['public']['Tables']['feuds']['Row'];

const FRESH_IDEAS = [
  { title: "The Algorithm", desc: "A tech-savvy heel uses AI and data analytics to predict their opponent's every move. Success Probability charts included." },
  { title: "The Debt Collector", desc: "A veteran claims responsibility for a younger star's success and demands a percentage of their winner's purse." },
  { title: "The Identity Thief", desc: "Wrestler comes to the ring in rival's gear, music, and wins using the rival's finisher." },
  { title: "The Silent Saboteur", desc: "Weekly technical glitches (music, lights, ropes) ruining matches. A mystery whodunit whithout words." },
  { title: "The Good Samaritan", desc: "Toxic positivity. Heel refuses to fight, 'forgives' the face, and stages mandatory peace summits." },
  { title: "The Contractual Hostage", desc: "Heel wins a match to become the legal manager of the face, forcing demeaning chores and handicap matches." },
  { title: "The Speedrun Specialist", desc: "Cardio-king sets a 5-minute timer on the Titantron. Walks out if the match goes past the limit." },
  { title: "The Legacy Eraser", desc: "Veteran vandalizes Hall of Fame displays and legally trademarks the legend's name to delete their history." },
  { title: "Social Media Mojo", desc: "Heel refuses to wrestle because the face isn't 'viral' enough or doesn't have enough followers." },
  { title: "The Sleep Agent", desc: "Psychological feud using trigger words via the PA system to cause blackouts and partner betrayal." },
  { title: "The Ring Architect", desc: "Heel alters the environment every week: shrinking ring size, removing turnbuckle pads, etc." },
  { title: "Sponsorship Hijack", desc: "Heel ruins real-world endorsement shoots and gets contracts moved to their own name." },
  { title: "The Record Breaker", desc: "Heel obsessed with an obscure stat (e.g. 'Most minutes without a suplex') and avoids specific moves at all costs." },
  { title: "The Fan Proxy", desc: "Heel lets a disgruntled fan call the strategy via headset and treat them like a GM." },
  { title: "Career Simulation", desc: "Cocky heel treats matches like a video game, complaining about 'button lag' and treating faces like NPCs." }
];

export function FeudTracker() {
  const [feuds, setFeuds] = useState<Feud[]>([]);
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [wrestlersRes, feudsRes] = await Promise.all([
        supabase.from('wrestlers').select('*').order('name'),
        supabase.from('feuds').select('*').order('created_at', { ascending: false })
      ]);

      if (wrestlersRes.error) throw wrestlersRes.error;
      if (feudsRes.error) throw feudsRes.error;

      setWrestlers(wrestlersRes.data || []);
      setFeuds(feudsRes.data || []);
    } catch (error) {
      console.error('Error fetching feuds data:', error);
    } finally {
      setLoading(false);
    }
  }

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    wrestler1_id: '',
    wrestler2_id: '',
    description: '',
    intensity: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Active' as 'Active' | 'On Hold' | 'Resolved',
  });

  const filteredWrestlers = useMemo(() => {
    return wrestlers.filter(w => w.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [wrestlers, debouncedSearch]);

  function getInspiration() {
    const idea = FRESH_IDEAS[Math.floor(Math.random() * FRESH_IDEAS.length)];
    setFormData(prev => ({
      ...prev,
      description: `${idea.title}: ${idea.desc}`
    }));
  }

  function suggestOpponent(pos: 1 | 2, type: 'Fresh' | 'Certain') {
    const otherId = pos === 1 ? formData.wrestler2_id : formData.wrestler1_id;
    const other = wrestlers.find(w => w.id === otherId);

    let potential = wrestlers.filter(w => w.id !== otherId);

    if (other) {
      potential = potential.filter(w => w.brand === other.brand);
      if (type === 'Fresh') {
        potential = potential.filter(w => w.alignment !== other.alignment);
      } else {
        potential = potential.filter(w => w.title || Math.random() > 0.4);
      }
    }

    const suggested = potential[Math.floor(Math.random() * potential.length)];
    if (suggested) {
      setFormData(prev => ({
        ...prev,
        [pos === 1 ? 'wrestler1_id' : 'wrestler2_id']: suggested.id
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.wrestler1_id || !formData.wrestler2_id) return;
    if (formData.wrestler1_id === formData.wrestler2_id) {
      alert('Please select two different superstars');
      return;
    }

    try {
      const { error } = await supabase
        .from('feuds')
        .insert([{
          wrestler1_id: formData.wrestler1_id,
          wrestler2_id: formData.wrestler2_id,
          description: formData.description,
          intensity: formData.intensity,
          status: formData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error creating feud:', error);
      alert('Error creating feud. Check permissions.');
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to end this rivalry?')) {
      try {
        const { error } = await supabase
          .from('feuds')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setFeuds(feuds.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting feud:', error);
        alert('Error ending rivalry. Check permissions.');
      }
    }
  }

  function resetForm() {
    setFormData({
      wrestler1_id: '',
      wrestler2_id: '',
      description: '',
      intensity: 'Medium',
      status: 'Active',
    });
    setIsAdding(false);
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Low': return 'text-green-500 fill-green-500/20';
      case 'Medium': return 'text-yellow-500 fill-yellow-500/20';
      case 'High': return 'text-red-500 fill-red-500/20';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider italic">Feud Tracker</h2>
            <p className="text-gray-400 text-sm">{feuds.length} Active Rivalries</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-8 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-95"
        >
          {isAdding ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel Feud' : 'Initialize Rivalry'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-lg rounded-[2rem] border border-yellow-500/30 p-8 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Superstar Alpha</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => suggestOpponent(1, 'Fresh')} className="text-[9px] font-black text-blue-400 hover:text-white transition-colors" title="Suggest Fresh Rival">Fresh</button>
                  <button type="button" onClick={() => suggestOpponent(1, 'Certain')} className="text-[9px] font-black text-yellow-400 hover:text-white transition-colors" title="Suggest Certain Rival">Certain</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    aria-label="Search Superstars for slot Alpha"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:ring-1 focus:ring-yellow-500 outline-none shadow-inner"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <select
                  value={formData.wrestler1_id}
                  onChange={(e) => setFormData({ ...formData, wrestler1_id: e.target.value })}
                  aria-label="Select Superstar Alpha"
                  className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  required
                >
                  <option value="">Select Talent</option>
                  {filteredWrestlers.slice(0, 100).map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.alignment})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Superstar Beta</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => suggestOpponent(2, 'Fresh')} className="text-[9px] font-black text-blue-400 hover:text-white transition-colors">Fresh</button>
                  <button type="button" onClick={() => suggestOpponent(2, 'Certain')} className="text-[9px] font-black text-yellow-400 hover:text-white transition-colors">Certain</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    aria-label="Search Superstars for slot Beta"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:ring-1 focus:ring-yellow-500 outline-none shadow-inner"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <select
                  value={formData.wrestler2_id}
                  onChange={(e) => setFormData({ ...formData, wrestler2_id: e.target.value })}
                  aria-label="Select Superstar Beta"
                  className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  required
                >
                  <option value="">Select Talent</option>
                  {filteredWrestlers.slice(0, 100).map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.alignment})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Heat Intensity</label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, intensity: level })}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${formData.intensity === level
                        ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg'
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-yellow-500/30'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="conflict-status" className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Conflict Status</label>
                <select
                  id="conflict-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'On Hold' | 'Resolved' })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none shadow-sm"
                >
                  <option value="Active">Operational / Active</option>
                  <option value="On Hold">Backburner / On Hold</option>
                  <option value="Resolved">Concluded / Resolved</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-12 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Creative Premise</label>
                <button
                  type="button"
                  onClick={getInspiration}
                  className="flex items-center gap-2 text-[10px] font-black text-purple-400 hover:text-white transition-all bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30 shadow-sm"
                >
                  <Lightbulb className="w-3 h-3" /> Get Spark of Inspiration
                </button>
              </div>
              <textarea
                placeholder="Incident report: What ignited this war? What's the endgame?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-[1.5rem] py-6 px-6 text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none min-h-[120px] shadow-inner font-medium leading-relaxed"
                maxLength={1000}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button
              type="submit"
              className="flex-1 py-5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:from-yellow-400 hover:to-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              Initialize Conflict <Zap className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-12 py-5 bg-gray-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-600 transition-all active:scale-95"
            >
              Abort
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {feuds.map((feud) => {
          const w1 = wrestlers.find(w => w.id === feud.wrestler1_id);
          const w2 = wrestlers.find(w => w.id === feud.wrestler2_id);

          return (
            <div
              key={feud.id}
              className="group relative bg-gray-800/20 backdrop-blur-md border border-gray-700/50 rounded-[2.5rem] overflow-hidden hover:border-yellow-500/50 transition-all shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Wrestler 1 */}
                <div className="relative flex-1 bg-gray-900 min-h-[240px] sm:min-h-0 overflow-hidden">
                  {w1?.image_url ? (
                    <img
                      src={w1.image_url}
                      alt={w1.name}
                      className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://www.thesmackdownhotel.com/images/roster/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Zap className="w-20 h-20" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${w1?.alignment === 'Heel' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>{w1?.alignment}</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mt-2">{w1?.name || 'Unknown'}</h4>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="relative flex items-center justify-center bg-gray-800 border-x border-gray-700 w-full sm:w-20 h-16 sm:h-auto z-10 shadow-2xl">
                  <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                  <span className="text-2xl font-black text-yellow-500 italic z-20 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">VS</span>
                </div>

                {/* Wrestler 2 */}
                <div className="relative flex-1 bg-gray-900 min-h-[240px] sm:min-h-0 overflow-hidden">
                  {w2?.image_url ? (
                    <img
                      src={w2.image_url}
                      alt={w2.name}
                      className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://www.thesmackdownhotel.com/images/roster/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Zap className="w-20 h-20" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-right">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${w2?.alignment === 'Heel' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>{w2?.alignment}</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mt-2">{w2?.name || 'Unknown'}</h4>
                  </div>
                </div>
              </div>

              {/* Feud Details Overlay (Bottom) */}
              <div className="p-8 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 gap-6 flex flex-col sm:flex-row items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 p-1 px-2 bg-gray-950 rounded-lg border border-gray-800 shadow-inner">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Flame
                          key={i}
                          className={`w-5 h-5 ${i < (feud.intensity === 'High' ? 3 : feud.intensity === 'Medium' ? 2 : 1) ? getIntensityColor(feud.intensity) : 'text-gray-900'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-xl border-2 shadow-lg ${feud.status === 'Active' ? 'bg-green-600/10 border-green-500/30 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}>
                      {feud.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 italic font-medium bg-gray-950/50 p-4 rounded-2xl border border-gray-800/50 group-hover:text-gray-300 transition-colors">"{feud.description || 'Confidential scenario data...'}"</p>
                </div>

                <button
                  onClick={() => handleDelete(feud.id)}
                  className="p-4 bg-red-600/10 text-red-500 hover:text-white hover:bg-red-600 rounded-[1.5rem] transition-all border border-red-500/20 shadow-xl group/del active:scale-90"
                  title="Conclude Rivalry"
                >
                  <Trash2 className="w-6 h-6 group-hover/del:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {!loading && feuds.length === 0 && (
        <div className="text-center py-48 bg-gray-800/10 rounded-[3rem] border border-gray-700/50 border-dashed">
          <div className="inline-block p-6 bg-gray-900/50 rounded-full mb-8">
            <Zap className="w-20 h-20 text-gray-800 opacity-20" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">Battleground Dormant</h3>
          <p className="text-gray-600 mt-2 font-black uppercase tracking-widest text-xs opacity-50">Initialize a conflict to begin tactical tracking</p>
        </div>
      )}
    </div>
  );
}
