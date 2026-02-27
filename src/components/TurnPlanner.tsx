import { useState, useMemo, useEffect } from 'react';
import { RefreshCcw, AlertCircle, ChevronRight, MessageSquare, UserCheck, ShieldOff, BrainCircuit, Target } from 'lucide-react';
import rosterData from '../data/roster.json';

interface Wrestler {
  id: string;
  name: string;
  brand: string;
  alignment: string;
  image_url?: string;
}

interface TurnMethod {
  name: string;
  description: string;
  effectiveness: 'High' | 'Medium' | 'Low';
  risk: 'High' | 'Medium' | 'Low';
  steps: string[];
  promos: string[];
  key_lines: string[];
}

const HEEL_TURN_METHODS: TurnMethod[] = [
  {
    name: 'The Brutal Beatdown',
    description: 'Viciously attack a beloved face, especially after helping them',
    effectiveness: 'High',
    risk: 'Low',
    steps: [
      'Build friendship/partnership with popular face',
      'Win their trust over several weeks',
      'Celebrate a big victory together',
      'Suddenly attack them with excessive force',
      'Cut promo explaining your "justified" actions',
    ],
    promos: ['The "I did it for me" explanation promo.', 'The silent, cold-staredown segment.'],
    key_lines: ["I'm tired of carrying you.", "This isn't business, it's personal.", "The world is better off with the real me."]
  },
  {
    name: 'The Identity Theft',
    description: 'Steal the opponent\'s finishers, gear, and persona',
    effectiveness: 'High',
    risk: 'Medium',
    steps: [
      'Appear in the rivals entrance gear during their match',
      'Win a match using the rivals signature finisher',
      'Psychologically mock the victims "brand"',
      'Fully transition into a dark reflection of the hero',
    ],
    promos: ['The "Imitation is the sincerest form of murder" promo.', 'Wearing the rivals mask/colors while mocking them.'],
    key_lines: ["I look better in your skin than you ever did.", "Everything you have, I can do better. Including being YOU.", "There's no room for the original when the upgrade is here."]
  },
  {
    name: 'The Sleep Agent',
    description: 'Suddenly turn on a partner via a psychological "trigger"',
    effectiveness: 'Medium',
    risk: 'High',
    steps: [
      'Display strange, vacant behavior for several weeks',
      'A specific sound or word plays over the PA system',
      'Immediately attack everything in sight, including partners',
      'Claim no memory of the event the next night',
    ],
    promos: ['The "Blackout" sit-down interview.', 'The reveal of the "Handler" who controls the triggers.'],
    key_lines: ["I don't remember doing it. But I remember how GOOD it felt.", "When the bell rings, I'm not in control anymore.", "The person you loved is dormant. The weapon is awake."]
  },
];

const FACE_TURN_METHODS: TurnMethod[] = [
  {
    name: 'The Heroic Save',
    description: 'Save a face from a beatdown despite your heel status',
    effectiveness: 'High',
    risk: 'Low',
    steps: [
      'Witness heel group attacking face 3-on-1',
      'Show hesitation, then intervene',
      'Fight off your former allies',
      'Help the face to their feet',
      'Former group declares war on you',
    ],
    promos: ['The "Enough is enough" declaration.', 'The reconciliation handshake segment.'],
    key_lines: ["I couldn't stand by and watch that anymore.", "I was wrong about a lot of things. But I'm right about this.", "I'm coming for all of you."]
  },
  {
    name: 'Broken Programming',
    description: 'Combat an "Algorithm" or "Identity" curse to regain soul',
    effectiveness: 'Medium',
    risk: 'High',
    steps: [
      'Show signs of internal struggle against a heel handler',
      'Intentionally lose a match to prevent hurting a friend',
      'Destroy the "Tech/Data" source controlling your persona',
      'Emotional promo about rediscovering individuality',
    ],
    promos: ['The "I am not a machine" manifesto.', 'Publicly shattering the laptops/tablets of the heel group.'],
    key_lines: ["You can't quantify my heart with your data.", "The algorithm didn't account for me being a human being.", "I'm off the grid, and I'm coming for my soul back."]
  }
];

export function TurnPlanner() {
  const [selectedWrestlerId, setSelectedWrestlerId] = useState<string | null>(null);
  const [selectedMethodName, setSelectedMethodName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const wrestlers = rosterData as Wrestler[];

  const selectedWrestler = useMemo(() =>
    wrestlers.find(w => w.id === selectedWrestlerId),
    [selectedWrestlerId, wrestlers]
  );

  const turnType = selectedWrestler?.alignment === 'Heel' ? 'face' : 'heel';
  const availableMethods = turnType === 'heel' ? HEEL_TURN_METHODS : FACE_TURN_METHODS;
  const selectedMethod = availableMethods.find(m => m.name === selectedMethodName);

  const filteredWrestlers = useMemo(() => {
    return wrestlers.filter(w => w.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [wrestlers, debouncedSearch]);

  function executeTurn() {
    if (!selectedWrestler || !selectedMethod) return;

    const savedStorylines = JSON.parse(localStorage.getItem('wwe_storylines') || '[]');

    const storylineTitle = `${turnType === 'heel' ? 'Heel' : 'Face'} Turn: ${selectedWrestler.name}`;
    const storylineDescription = `${selectedWrestler.name} undergoes a major character shift via ${selectedMethod.name}: ${selectedMethod.description}`;

    const newStoryline = {
      id: Date.now().toString(),
      title: storylineTitle,
      description: storylineDescription,
      type: turnType === 'heel' ? 'Heel Turn' : 'Face Turn',
      participants: [selectedWrestler.id],
      execution_steps: selectedMethod.steps,
      promos: selectedMethod.promos,
      key_lines: selectedMethod.key_lines,
      favorited: false,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('wwe_storylines', JSON.stringify([newStoryline, ...savedStorylines]));

    alert(`${selectedWrestler.name} is now scheduled for a ${turnType} turn. The execution plan has been saved to your Storylines!`);

    setSelectedWrestlerId(null);
    setSelectedMethodName(null);
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="p-3 bg-green-600/20 rounded-xl border border-green-600/30">
          <RefreshCcw className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider italic">Turn Planner</h2>
          <p className="text-gray-400 text-sm">Orchestrate Career-Defining Evolution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Wrestler Selection */}
        <div className="lg:col-span-1 bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700 p-6 space-y-4 shadow-xl">
          <label className="text-gray-400 text-xs font-black uppercase tracking-widest pl-1">Superstar</label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search talent..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:ring-1 focus:ring-green-500 shadow-inner"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredWrestlers.map((wrestler) => (
              <button
                key={wrestler.id}
                onClick={() => {
                  setSelectedWrestlerId(wrestler.id);
                  setSelectedMethodName(null);
                }}
                className={`w-full group relative p-4 rounded-2xl transition-all border ${selectedWrestlerId === wrestler.id
                  ? 'bg-green-600 border-green-500 text-white shadow-xl translate-x-1'
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-green-600/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-black uppercase tracking-tighter truncate italic">{wrestler.name}</div>
                    <div className={`text-[10px] font-bold uppercase ${selectedWrestlerId === wrestler.id ? 'text-white/80' : 'text-gray-600'}`}>
                      {wrestler.alignment} • {wrestler.brand}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${selectedWrestlerId === wrestler.id ? 'translate-x-1' : 'opacity-20'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column: Method Selection */}
        <div className="lg:col-span-1 bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700 p-6 space-y-4 shadow-xl">
          <label className="text-gray-400 text-xs font-black uppercase tracking-widest pl-1">Evolution Track</label>
          {selectedWrestler ? (
            <div className="space-y-3">
              <div className="mb-4 text-center p-4 bg-gray-950/50 rounded-2xl border border-gray-800 border-dashed">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Psychological State</p>
                <div className="flex items-center justify-center gap-6">
                  <span className={`text-xs font-black uppercase ${selectedWrestler.alignment === 'Heel' ? 'text-red-500' : 'text-blue-500'}`}>{selectedWrestler.alignment}</span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 blur-md opacity-20 animate-pulse" />
                    <RefreshCcw className="w-5 h-5 text-green-500 relative animate-spin-slow" />
                  </div>
                  <span className={`text-xs font-black uppercase italic ${turnType === 'heel' ? 'text-red-500' : 'text-blue-500'}`}>
                    {turnType}
                  </span>
                </div>
              </div>

              {availableMethods.map((method) => (
                <button
                  key={method.name}
                  onClick={() => setSelectedMethodName(method.name)}
                  className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedMethodName === method.name
                    ? 'bg-gray-900 border-green-500 shadow-xl ring-1 ring-green-500/20'
                    : 'bg-gray-900/40 border-gray-800 hover:border-green-500/30'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-lg font-black uppercase tracking-tighter italic ${selectedMethodName === method.name ? 'text-green-500' : 'text-white'}`}>
                      {method.name}
                    </div>
                    {method.name === 'The Identity Theft' || method.name === 'The Sleep Agent' ? <BrainCircuit className="w-4 h-4 text-indigo-400" /> : null}
                  </div>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{method.description}</p>
                  <div className="flex gap-6">
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Stability</p>
                      <p className={`text-[10px] font-black ${method.effectiveness === 'High' ? 'text-green-500' : 'text-yellow-500'}`}>{method.effectiveness}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Narrative Risk</p>
                      <p className={`text-[10px] font-black ${method.risk === 'Low' ? 'text-green-500' : 'text-red-500'}`}>{method.risk}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-600 space-y-4">
              <ShieldOff className="w-12 h-12 opacity-10 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center px-8 text-gray-700 leading-wider">Select Talent to<br />Analyze Instability</p>
            </div>
          )}
        </div>

        {/* Right Column: Detail & Execution */}
        <div className="lg:col-span-1">
          {selectedMethod && selectedWrestler ? (
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-green-500/30 p-8 space-y-8 animate-in slide-in-from-right-4 duration-500 h-full flex flex-col shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-950 border-2 border-green-500/20 shadow-xl">
                  {selectedWrestler.image_url ? (
                    <img src={selectedWrestler.image_url} alt={selectedWrestler.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900"><UserCheck className="w-6 h-6 text-green-500" /></div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">{selectedWrestler.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{selectedWrestler.brand}</p>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500">{turnType} conversion</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-950/50 rounded-2xl p-6 border border-gray-800/50 shadow-inner">
                  <label className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Script Architecture</label>
                  <div className="space-y-4">
                    {selectedMethod.steps.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start group">
                        <span className="text-sm font-black text-green-500 italic mt-0.5 group-hover:scale-110 transition-transform">{(i + 1).toString().padStart(2, '0')}</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50 space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">
                      <MessageSquare className="w-3 h-3" /> Narrative Beats
                    </h4>
                    <ul className="space-y-2">
                      {selectedMethod.promos.map((p, i) => (
                        <li key={i} className="text-[11px] text-gray-500 italic">• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-3">
                      <Target className="w-3 h-3" /> Key Dialogue
                    </h4>
                    <p className="text-[11px] text-white font-black italic bg-gray-950 p-3 rounded-xl border-l-2 border-yellow-500 italic shadow-sm">
                      "{selectedMethod.key_lines[Math.floor(Math.random() * selectedMethod.key_lines.length)]}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <button
                  onClick={executeTurn}
                  className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:from-green-500 hover:to-emerald-500 transition-all shadow-xl shadow-green-600/10 active:scale-95 flex items-center justify-center gap-3"
                >
                  Confirm Transformation <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-950/20 rounded-[2rem] border border-gray-800 border-dashed h-full flex flex-col items-center justify-center text-gray-700 p-12 text-center group">
              <div className="w-20 h-20 bg-gray-900/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500/5 transition-colors">
                <AlertCircle className="w-10 h-10 opacity-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-loose opacity-40">Ready for Strategy<br />Initialization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type SearchProps = React.SVGProps<SVGSVGElement>;

const Search = ({ className, ...props }: SearchProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
