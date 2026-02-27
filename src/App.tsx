import { useState } from 'react';
import { Users, Zap, Sparkles, RefreshCcw } from 'lucide-react';
import { RosterManager } from './components/RosterManager';
import { FeudTracker } from './components/FeudTracker';
import { StorylineGenerator } from './components/StorylineGenerator';
import { TurnPlanner } from './components/TurnPlanner';

type Tab = 'roster' | 'feuds' | 'generator' | 'turns';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  const tabs = [
    { id: 'generator' as Tab, name: 'Creative Studio', icon: Sparkles, color: 'purple', glow: 'shadow-purple-500/20' },
    { id: 'turns' as Tab, name: 'Turn Planner', icon: RefreshCcw, color: 'green', glow: 'shadow-green-500/20' },
    { id: 'feuds' as Tab, name: 'Feud Tracker', icon: Zap, color: 'yellow', glow: 'shadow-yellow-500/20' },
    { id: 'roster' as Tab, name: 'Roster', icon: Users, color: 'red', glow: 'shadow-red-500/20' },
  ];

  const getTabStyles = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'red': return 'bg-red-600 border-red-500 text-white shadow-lg scale-105';
        case 'yellow': return 'bg-yellow-500 border-yellow-400 text-black shadow-lg scale-105';
        case 'purple': return 'bg-purple-600 border-purple-500 text-white shadow-lg scale-105';
        case 'green': return 'bg-green-600 border-green-500 text-white shadow-lg scale-105';
        default: return 'bg-gray-700 border-gray-600 text-white';
      }
    }
    return 'bg-gray-900/50 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-red-600/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-gray-800/50 bg-gray-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/20 border border-red-500/30">
                <span className="text-white font-black text-2xl sm:text-4xl italic tracking-tighter">W</span>
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                  Creative Control
                </h1>
                <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-900/50 px-2 py-0.5 rounded inline-block border border-gray-800">
                  Version 2026.1 • Experimental
                </p>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${getTabStyles(tab.color, activeTab === tab.id)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-in fade-in duration-700">
          {activeTab === 'roster' && <RosterManager />}
          {activeTab === 'feuds' && <FeudTracker />}
          {activeTab === 'generator' && <StorylineGenerator />}
          {activeTab === 'turns' && <TurnPlanner />}
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-900 py-12 bg-gray-950/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <span className="w-12 h-px bg-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-800" />
            <span className="w-12 h-px bg-gray-900" />
          </div>
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
            WWE Creative Control • Master the Booking
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
