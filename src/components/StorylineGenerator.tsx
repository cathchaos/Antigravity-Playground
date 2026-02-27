import { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { Sparkles, Star, Trash2, RefreshCw, Search, ChevronRight, Calendar, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import rosterData from '../data/roster.json';

interface Wrestler {
  id: string;
  name: string;
  brand: string;
  alignment: string;
  status: string;
  title?: string | null;
  image_url?: string | null;
  gender?: 'Male' | 'Female';
  cardLevel?: number; // 1: Jobber, 2: Midcard, 3: Upper Midcard, 4: Main Event, 5: Legend
}

interface Storyline {
  id: string;
  title: string;
  description: string;
  type: string;
  participants: string[];
  execution_steps: string[];
  promos?: string[];
  key_lines?: string[];
  created_at: string;
  favorited: boolean;
}

interface TemplateDefinition {
  title: string;
  description: string;
  steps: string[];
  promos: string[];
  key_lines: string[];
  isFresh?: boolean;
}

interface StorylineTemplate {
  type: string;
  templates: TemplateDefinition[];
}

const WWE_CHAMPIONSHIPS = [
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

const STORYLINE_TEMPLATES: StorylineTemplate[] = [
  {
    type: 'Heel Turn',
    templates: [
      {
        title: 'The Betrayal',
        description: 'A trusted ally turns on their partner at a critical moment',
        steps: [
          'Build up the tag team / alliance over several weeks',
          'Have them win a big match together',
          'Create tension with subtle disagreements during the match',
          'Partner costs them a championship opportunity by walking away',
          'Vicious post-match attack using a steel chair',
        ],
        promos: [
          'The "Why, [Name], Why?" segment where the victim demands answers.',
          'The "I held you up" promo: [Heel] explains they were the real star of the team.',
        ],
        key_lines: [
          "I didn't turn my back on you. I just finally saw you for who you really are: dead weight.",
          "You were the anchor at my neck, and today, I'm cutting the rope.",
          "Check the history books, [Name]. I was always the one people paid to see."
        ]
      },
      {
        title: 'The Corruption',
        description: 'A face gradually becomes frustrated and embraces darker methods',
        steps: [
          'Show the face losing repeatedly despite following the rules',
          'Have a heel manager whisper in their ear backstage',
          'The face uses a low blow to win a qualifier match',
          'Full confrontation with their mentor who denounces them',
        ],
        promos: [
          'The "Nice guys finish last" manifesto.',
          'Backstage interview where they refuse to answer questions and just smirk.',
        ],
        key_lines: [
          "I did it the right way for ten years. What did it get me? A 'Thank You' and a handshake. The handshake doesn't pay for the surgery.",
          "Stop cheering me. Your cheers don't win matches. Pain wins matches.",
          "The legend you knew is dead. I'm the reality you're afraid to face."
        ]
      },
    ],
  },
  {
    type: 'Fresh Feud',
    templates: [
      {
        title: 'The Collision Course',
        description: 'Two stars on winning streaks inevitably clash',
        steps: [
          'Both superstars win squash matches on the same night',
          'Tense staredown on the ramp after a main event',
          'A "Contract Signing" that ends in absolute chaos',
          'Go-home show: One costs the other a match through distraction',
        ],
        promos: [
          'The "Top of the Mountain" promo: Both claim the brand belongs to them.',
          'Split-screen interview where they talk over each other.',
        ],
        key_lines: [
          "There's only room for one king in this kingdom, and you're looking at him.",
          "You call yourself the best in the world? I call you the best at talking. Come show me if you can fight.",
          "The streak ends at [Event Name]. I'm not just a roadblock, I'm the end of the road."
        ]
      },
      {
        title: 'The Algorithm',
        description: 'A tech-savvy heel uses AI and data analytics to predict moves',
        isFresh: true,
        steps: [
          'Heel presents "Success Probability" charts during a promo',
          'Heel counters every signature move in the first match with ease',
          'The babyface starts using a completely different wrestling style to confuse data',
          'The "Logic Error" moment where the heel freezes due to unpredictable chaos',
        ],
        promos: [
          'Presentation of the "Victory Probability Index".',
          'The "Human Error" segment where the face destroys the laptop.',
        ],
        key_lines: [
          "My data says you have a 0.04% chance of hitting that finisher. Why even try?",
          "I don't need luck. I have a 256-bit encryption on your career.",
          "You're not a superstar, you're a glitch in the system that I'm about to patch."
        ]
      }
    ],
  },
  {
    type: 'Face Turn',
    templates: [
      {
        title: 'The Redemption',
        description: 'Heel realizes the error of their ways and seeks forgiveness',
        steps: [
          'Witness the heel faction attacking a defenseless rookie',
          'Heel refuses to join the beatdown and walks away',
          'Backstage save: Heel saves a face from a 3-on-1 attack',
          'The "I missed this" promo acknowledging the crowd support',
        ],
        promos: [
          'The "I forgot what it felt like to be a man" sit-down interview.',
          'Public apology to a former rival they wronged.',
        ],
        key_lines: [
          "I looked in the mirror this morning and for the first time in years, I didn't recognize the person looking back.",
          "If you want to get to him, you've gotta go through me first. And I'm not the man I was yesterday.",
          "I don't expect your forgiveness. I just expect to earn your respect."
        ]
      }
    ]
  }
];

const WrestlerSelectButton = memo(({ wrestler, isSelected, onToggle }: any) => (
  <button
    onClick={() => onToggle(wrestler.id)}
    className={`relative p-3 rounded-xl border transition-all text-left overflow-hidden ${isSelected
      ? 'bg-purple-600/20 border-purple-500 shadow-xl'
      : 'bg-gray-900/50 border-gray-800 hover:border-purple-500/30'
      }`}
  >
    <div className="relative z-10">
      <p className={`text-xs font-black uppercase tracking-tighter truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
        {wrestler.name}
      </p>
      <p className={`text-[9px] font-bold uppercase ${isSelected ? 'text-purple-300' : 'text-gray-600'}`}>
        {wrestler.brand} • {wrestler.alignment}
      </p>
    </div>
  </button>
));

export function StorylineGenerator() {
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Heel Turn');
  const [templatePreference, setTemplatePreference] = useState<'Classic' | 'Fresh'>('Classic');
  const [selectedWrestlers, setSelectedWrestlers] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customContext, setCustomContext] = useState('');

  const [roadmapData, setRoadmapData] = useState({
    championId: '',
    duration: '3 Months',
    theme: 'Dominant Reign',
    feudCount: 3,
    feudPreference: 'Fresh' as 'Certain' | 'Fresh',
    targetTitle: 'World Heavyweight Championship',
    customContext: '',
    useAI: false
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const savedRoster = localStorage.getItem('wwe_roster');
    let actualRoster = savedRoster ? JSON.parse(savedRoster) : rosterData;

    actualRoster = (actualRoster as Wrestler[]).map(w => {
      if (w.gender && w.cardLevel) return w;
      const titleLower = (w.title || '').toLowerCase();
      const nameLower = w.name.toLowerCase();
      let gender: 'Male' | 'Female' = 'Male';
      if (titleLower.includes('women') ||
        ['rhe', 'becky', 'liv ', 'natti', 'jade', 'asuka', 'bayle', 'charlotte', 'iyo'].some(n => nameLower.includes(n))) {
        gender = 'Female';
      }
      let level = 2;
      if (w.title) level = 4;
      if (['punk', 'cody', 'knight', 'orton', 'reigns', 'drew', 'gunther', 'rhea', 'belair'].some(n => nameLower.includes(n))) {
        level = 4;
      }
      if (['rayo', 'kit ', 'akira', 'tozawa', 'bravo'].some(n => nameLower.includes(n))) {
        level = 1;
      }
      return { ...w, gender, cardLevel: level };
    });

    setWrestlers(actualRoster);
    const savedStorylines = localStorage.getItem('wwe_storylines');
    if (savedStorylines) setStorylines(JSON.parse(savedStorylines));
    setLoading(false);
  }, []);

  const saveToStorage = (newStorylines: Storyline[]) => {
    setStorylines(newStorylines);
    localStorage.setItem('wwe_storylines', JSON.stringify(newStorylines));
  };

  const filteredWrestlers = useMemo(() => {
    return wrestlers.filter(w => w.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [wrestlers, debouncedSearch]);

  const toggleWrestlerSelection = useCallback((id: string) => {
    setSelectedWrestlers(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  }, []);

  const suggestRival = useCallback((type: 'Certain' | 'Fresh') => {
    if (selectedWrestlers.length === 0) return;
    const currentId = selectedWrestlers[0];
    const current = wrestlers.find(w => w.id === currentId);
    if (!current) return;

    const brandWrestlers = wrestlers.filter(w => w.brand === current.brand && w.id !== current.id);
    const logicalOpponents = brandWrestlers.filter(w => {
      if (w.gender !== (current.gender || 'Male')) return false;
      if ((current.cardLevel || 2) >= 3 && (w.cardLevel || 2) <= 1) return false;
      return true;
    });

    const pool = logicalOpponents.length > 0 ? logicalOpponents : brandWrestlers;
    let possible: Wrestler[];
    if (type === 'Fresh') {
      possible = pool.filter(w => w.alignment !== current.alignment);
    } else {
      possible = pool.filter(w => (w.cardLevel || 2) >= 3);
    }

    if (possible.length > 0) {
      const rival = possible[Math.floor(Math.random() * possible.length)];
      setSelectedWrestlers([currentId, rival.id]);
    }
  }, [selectedWrestlers, wrestlers]);

  async function generateStoryline() {
    if (selectedWrestlers.length === 0) return;
    if (roadmapData.useAI && !geminiKey) { alert('API Key Required'); return; }

    setIsGeneratingAI(true);
    try {
      let title, description, steps, promos, key_lines;
      const participantsNames = selectedWrestlers.map(id => wrestlers.find(w => w.id === id)?.name || 'Unknown');

      if (roadmapData.useAI) {
        const prompt = `Generate a WWE storyline for: ${participantsNames.join(' & ')}. Type: ${selectedType}. Notes: ${customContext}. Return JSON { "title": "...", "description": "...", "steps": ["..."], "promos": ["..."], "key_lines": ["..."] }`;
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST', body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const d = await resp.json();
        const j = JSON.parse(d.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)![0]);
        title = j.title; description = j.description; steps = j.steps; promos = j.promos || []; key_lines = j.key_lines || [];
      } else {
        const cat = STORYLINE_TEMPLATES.find(t => t.type === selectedType);
        const template = cat!.templates[Math.floor(Math.random() * cat!.templates.length)];
        title = `${template.title}: ${participantsNames.join(' & ')}`;
        description = template.description + (customContext ? ` [Note: ${customContext}]` : '');
        steps = template.steps; promos = template.promos; key_lines = template.key_lines;
      }

      const newS = { id: crypto.randomUUID(), title, description, type: selectedType, participants: selectedWrestlers, execution_steps: steps, promos, key_lines, created_at: new Date().toISOString(), favorited: false };
      saveToStorage([newS, ...storylines]);
      setShowSaved(true); setSelectedWrestlers([]); setCustomContext('');
    } catch (e) { alert('AI Error'); } finally { setIsGeneratingAI(false); }
  }

  async function generateLongTermRoadmap() {
    const champ = wrestlers.find(w => w.id === roadmapData.championId);
    if (!champ) return;
    setIsGeneratingAI(true);
    try {
      const newRoadmaps: Storyline[] = [];
      const pool = wrestlers.filter(w => w.brand === champ.brand && w.id !== champ.id && w.gender === champ.gender);

      for (let i = 0; i < roadmapData.feudCount; i++) {
        let opp = pool[Math.floor(Math.random() * pool.length)];
        let title, description, steps, promos, key_lines;

        if (roadmapData.useAI) {
          const prompt = `Generate long-term WWE feud: ${champ.name} vs ${opp.name} for ${roadmapData.targetTitle}. Theme: ${roadmapData.theme}. Note: ${roadmapData.customContext}. Return JSON { "title": "...", "description": "...", "steps": ["..."], "promos": ["..."], "key_lines": ["..."] }`;
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST', body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const d = await resp.json();
          const j = JSON.parse(d.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)![0]);
          title = j.title; description = j.description; steps = j.steps; promos = j.promos; key_lines = j.key_lines;
        } else {
          title = `[Roadmap] ${champ.name} vs ${opp.name}`;
          description = `Reign for ${roadmapData.targetTitle} (${roadmapData.theme})`;
          steps = ["Intense confrontation", "Contract signing", "Go-home brawl", "Premium Live Event Match"];
          promos = []; key_lines = [];
        }

        newRoadmaps.push({ id: crypto.randomUUID(), title, description, type: 'Long-term Roadmap', participants: [champ.id, opp.id], execution_steps: steps, promos, key_lines, created_at: new Date().toISOString(), favorited: false });
      }
      saveToStorage([...newRoadmaps, ...storylines]);
      setShowSaved(true); setShowRoadmapForm(false);
    } catch (e) { alert('AI Error'); } finally { setIsGeneratingAI(false); }
  }

  const handleDelete = (id: string) => saveToStorage(storylines.filter(s => s.id !== id));
  const toggleFavorite = (id: string) => saveToStorage(storylines.map(s => s.id === id ? { ...s, favorited: !s.favorited } : s));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heel Turn': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Face Turn': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Long-term Roadmap': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-600/30">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider italic">Creative Studio</h2>
            <p className="text-gray-400 text-sm">Booking Tomorrow's Main Events Today</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowRoadmapForm(!showRoadmapForm)} className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-purple-600/50 text-purple-400 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all">
            <Calendar className="w-5 h-5" /> Roadmap Architect
          </button>
          <button onClick={() => setShowSaved(!showSaved)} className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg">
            <Star className={`w-5 h-5 ${showSaved ? 'fill-current' : ''}`} /> {showSaved ? 'Back to Generator' : 'Saved Scripts'}
          </button>
        </div>
      </div>

      {showRoadmapForm && (
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-purple-500/50 p-8 shadow-2xl animate-in zoom-in-95">
          <h3 className="text-xl font-black text-white uppercase italic mb-8">Long-Term Booking Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 pb-8 border-b border-gray-700/50">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-gray-950/50 p-6 rounded-3xl border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-black uppercase text-xs">Gemini Engine</h4>
                    <p className="text-[10px] text-gray-500">Provide your Google AI key for brilliance.</p>
                  </div>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <input type="password" placeholder="API Key..." value={geminiKey} onChange={(e) => { setGeminiKey(e.target.value); localStorage.setItem('gemini_api_key', e.target.value); }} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-xs text-purple-300 outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Superstar</label>
              <select value={roadmapData.championId} onChange={(e) => setRoadmapData({ ...roadmapData, championId: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-3 px-5 text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all">
                <option value="">Select Talent</option>
                {wrestlers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.gender === 'Female' ? 'Women\'s' : w.brand})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Theme</label>
              <select value={roadmapData.theme} onChange={(e) => setRoadmapData({ ...roadmapData, theme: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-3 px-5 text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all">
                <option value="Dominant Reign">Dominant Reign</option><option value="Redemption">Redemption Arc</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Method</label>
              <div className="flex gap-2 p-1 bg-gray-950 rounded-2xl border border-gray-800">
                <button onClick={() => setRoadmapData({ ...roadmapData, useAI: false })} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${!roadmapData.useAI ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Template</button>
                <button onClick={() => setRoadmapData({ ...roadmapData, useAI: true })} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${roadmapData.useAI ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Gemini AI</button>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Director's Note</label>
              <textarea placeholder="e.g. He's a lonely wolf..." value={roadmapData.customContext} onChange={(e) => setRoadmapData({ ...roadmapData, customContext: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-3xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-purple-600 outline-none min-h-[100px]" />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={generateLongTermRoadmap} disabled={isGeneratingAI || !roadmapData.championId} className="flex-1 py-4 bg-purple-600 text-white font-black uppercase text-sm rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {isGeneratingAI ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Start Plan'}
            </button>
            <button onClick={() => setShowRoadmapForm(false)} className="px-8 py-4 bg-gray-700 text-white font-black uppercase text-sm rounded-2xl">Cancel</button>
          </div>
        </div>
      )}

      {!showSaved ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700 p-6 space-y-6 shadow-xl">
              <div>
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-4">Category</label>
                <div className="space-y-2">
                  {STORYLINE_TEMPLATES.map((t) => (
                    <button key={t.type} onClick={() => setSelectedType(t.type)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold border transition-all ${selectedType === t.type ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>
                      {t.type} <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block">Mode</label>
                <div className="flex gap-2">
                  <button onClick={() => setRoadmapData({ ...roadmapData, useAI: false })} className={`flex-1 py-3 rounded-xl text-[10px] font-black border ${!roadmapData.useAI ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-500'}`}>Classic</button>
                  <button onClick={() => setRoadmapData({ ...roadmapData, useAI: true })} className={`flex-1 py-3 rounded-xl text-[10px] font-black border ${roadmapData.useAI ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-500'}`}>Gemini AI</button>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block">Director's Note</label>
                <textarea placeholder="e.g. He thinks he's a king..." value={customContext} onChange={(e) => setCustomContext(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-xs text-white focus:ring-2 focus:ring-purple-600 outline-none min-h-[80px]" />
              </div>
              <button onClick={generateStoryline} disabled={isGeneratingAI || selectedWrestlers.length === 0} className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 text-white rounded-xl font-black uppercase text-sm hover:shadow-xl active:scale-95 disabled:opacity-30">
                {isGeneratingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Produce Script'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700 p-6 shadow-xl h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase block">Superstars ({selectedWrestlers.length})</label>
                  {selectedWrestlers.length === 1 && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => suggestRival('Fresh')} className="text-[10px] font-black text-blue-400 uppercase border border-blue-500/30 px-2 py-1 rounded bg-blue-500/5">Fresh Rival</button>
                      <button onClick={() => suggestRival('Certain')} className="text-[10px] font-black text-yellow-400 uppercase border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/5">Top Rival</button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input type="text" placeholder="Search..." className="w-48 bg-gray-900 border border-gray-700 rounded-xl py-2 pl-8 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredWrestlers.map((w) => <WrestlerSelectButton key={w.id} wrestler={w} isSelected={selectedWrestlers.includes(w.id)} onToggle={toggleWrestlerSelection} />)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 animate-spin text-purple-600" /></div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {storylines.length === 0 ? (
              <div className="col-span-full text-center py-40 text-gray-500 uppercase font-black tracking-widest">Vault Empty</div>
            ) : (
              storylines.map((s) => <StorylineCard key={s.id} storyline={s} wrestlers={wrestlers} onDelete={handleDelete} onToggleFavorite={toggleFavorite} getTypeColor={getTypeColor} />)
            )}
          </div>
        )
      )}
    </div>
  );
}

const ParticipantAvatar = ({ wrestler }: { wrestler: Wrestler }) => {
  const [imageError, setImageError] = useState(false);
  return (
    <div className="relative w-12 h-12 rounded-2xl border-4 border-gray-950 bg-gray-900 shadow-xl overflow-hidden" title={wrestler.name}>
      {wrestler.image_url && !imageError ? (
        <img src={wrestler.image_url} alt={wrestler.name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 p-1">
          <span className="text-[10px] font-black text-gray-400 uppercase">{wrestler.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
      )}
    </div>
  );
};

const StorylineCard = memo(({ storyline, wrestlers, onDelete, onToggleFavorite, getTypeColor }: any) => {
  const participants = (storyline.participants as string[]).map(id => wrestlers.find(w => w.id === id)).filter((w): w is Wrestler => !!w);
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-[2rem] p-8 flex flex-col h-full shadow-2xl">
      <div className="flex justify-between mb-6">
        <div className="space-y-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${getTypeColor(storyline.type)}`}>{storyline.type}</span>
          <h3 className="text-xl font-black text-white uppercase italic">{storyline.title}</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onToggleFavorite(storyline.id)} className={`p-3 bg-gray-950 border border-gray-700 rounded-2xl active:scale-90 ${storyline.favorited ? 'text-yellow-500' : 'text-gray-500'}`}><Star className="w-4 h-4 fill-current" /></button>
          <button onClick={() => onDelete(storyline.id)} className="p-3 bg-gray-950 border border-gray-700 rounded-2xl text-red-500 active:scale-90"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <p className="text-gray-400 text-sm italic mb-8 border-l-2 border-purple-500/50 pl-4">"{storyline.description}"</p>
      {participants.length > 0 && (
        <div className="flex items-center gap-3 mb-8">
          <div className="flex -space-x-3">{participants.map(p => <ParticipantAvatar key={p.id} wrestler={p} />)}</div>
          <p className="text-[10px] font-black text-gray-500 uppercase">{participants.length} Cast Members</p>
        </div>
      )}
      <div className="space-y-4 mt-auto">
        <div className="bg-gray-950/50 rounded-2xl p-4 border border-gray-800">
          <h4 className="text-[10px] font-black text-purple-500 uppercase mb-3">Booking Strategy</h4>
          <div className="space-y-2">
            {storyline.execution_steps.map((step: string, i: number) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="font-black text-gray-700">{(i + 1).toString().padStart(2, '0')}</span>
                <p className="text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
        {storyline.promos && storyline.promos.length > 0 && (
          <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800">
            <h4 className="text-[10px] font-black text-blue-400 uppercase mb-3">Script Beats</h4>
            <ul className="space-y-1">{storyline.promos.map((p: string, i: number) => <li key={i} className="text-[11px] text-gray-400 italic">• {p}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
});
