import { useState, useMemo } from 'react';
import { Sparkles, Star, Trash2, RefreshCw, Search, ChevronRight, Calendar, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import rosterData from '../data/roster.json';

interface Wrestler {
  id: string;
  name: string;
  brand: string;
  alignment: string;
  image_url?: string;
  title?: string;
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
  favorited: boolean;
  created_at: string;
  isFresh?: boolean;
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
      {
        title: 'The Gaslight Partner',
        description: 'Jealous tag partner manipulates and blames their partner instead of a beatdown',
        isFresh: true,
        steps: [
          'Heel intentionally misses a save, then blames the partner\'s positioning',
          'Heel "gaslights" the partner in backstage segments, showing "concern" for their failing health',
          'Heel convinces the management to put the partner in a series of "re-evaluation" matches',
          'The partner snaps when they see the heel smiling at their defeat on the monitor',
        ],
        promos: [
          'The "I\'m just doing this for your own good" segment.',
          'The "Are you sure you\'re okay, [Name]?" concern-trolling promo.',
        ],
        key_lines: [
          "I didn't fail you. You failed the team. I'm just the only one honest enough to tell you.",
          "Everyone is talking about how you've lost a step. I'm defending you, but you keep proving them right.",
          "Don't raise your voice at me. Your anger is why we're losing. Just listen to me, for once."
        ]
      },
      {
        title: 'The Shadow-Ban Boss',
        description: 'Evil board member removes wrestler from graphics and social media',
        isFresh: true,
        steps: [
          'Wrestler\'s entrance music fails to play, replaced by a generic track',
          'Wrestler is edited out of the show\'s intro package and social media headers',
          'A "Technical Error" prevents their name from appearing on the match graphic',
          'The "Ghost in the Machine" match where they fight to regain their identity',
        ],
        promos: [
          'The Corporate "Optimization" briefing.',
          'Backstage segment where the boss claims the wrestler is "un-marketable" and thus, invisible.',
        ],
        key_lines: [
          "You weren't fired. You were simply... de-prioritized by the algorithm.",
          "If you aren't on the website, do you even exist for the shareholders?",
          "Go ahead, hit me. No one will see it. We've already cut the feed to your specific camera."
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
      // --- NEW FRESH IDEAS START HERE ---
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
      },
      {
        title: 'The Identity Thief',
        description: 'Wrestler starts using rival gear, music, and finisher',
        isFresh: true,
        steps: [
          'Wrestler comes out to the rivals music while rival is in the ring',
          'Winning a match using the rivals signature finisher',
          'Vandalizing the rivals locker room and stealing their specific ring gear',
          'The "Who Am I?" psychological breakdown match',
        ],
        promos: [
          'The "Imitation is the sincerest form of murder" segment.',
          'Interview where the thief claims they are the "Upgraded Version" of the rival.',
        ],
        key_lines: [
          "I look better in this gear than you ever did. I wear your legacy like a cheap coat.",
          "It's not your finisher anymore. It's mine because I actually win with it.",
          "Look at the screen, look at the music, look at the gear. The world has already forgotten you exist."
        ]
      },
      {
        title: 'The "Good Samaritan"',
        description: 'Toxic positivity heel who refuses to fight and offers "therapy"',
        isFresh: true,
        steps: [
          'Heel refuses to strike back, instead offering a hug after being hit',
          'Staging a mandatory "Peace Summit" in the middle of the ring',
          'Heel brings a licensed therapist to ringside to "evaluate" the face',
          'The "Violent Brakthrough" where the face finally snaps due to the condescension',
        ],
        promos: [
          'The Ring-side Meditation session.',
          'Publicly "forgiving" the face for their "unrestrained anger issues".',
        ],
        key_lines: [
          "I'm not mad at you for hitting me, [Name]. I'm just disappointed in your lack of emotional maturity.",
          "Let's just breathe together. Conflict is a choice, and you're choosing poorly.",
          "I forgive you for being inferior. It's not your fault, it's your upbringing."
        ]
      },
      {
        title: 'The Silent Saboteur',
        description: 'Mystery whodunit with technical glitches and ring sabotage',
        isFresh: true,
        steps: [
          'Microphone cuts out during the face\'s most important promo',
          'Ring ropes "accidentally" snap during a high-flying move',
          'Lights go pitch black every time the face goes for the pin',
          'Reveal of the saboteur in the production truck, never saying a word',
        ],
        promos: [
          'The "Dead Air" segment where a promo is ruined by feedback.',
          'Security footage reveal that shows a hooded figure messing with cables.',
        ],
        key_lines: [
          "(Silence)",
          "(Static Noise plays over the PA system)",
          "..."
        ]
      },
      {
        title: 'The Speedrun Specialist',
        description: 'Cocky cardio-king sets 5-minute timers on the Titantron',
        isFresh: true,
        steps: [
          'Timer starts on the screen as the bell rings',
          'Heel walks out if the match goes past 5 minutes, claiming "time waste"',
          'Refusing to enter the ring until 2 minutes are left on the clock',
          'The "Iron Man" challenge where the face traps them in a 30-min match',
        ],
        promos: [
          'The "Too Busy For You" backstage walk-and-talk.',
          'Heel checking a luxury watch while the face is down.',
        ],
        key_lines: [
          "You've got 300 seconds to impress me. If you don't, I'm going to dinner.",
          "I didn't lose, I just stopped participating in a boring conversation.",
          "Tick-tock. Your time as a relevant star is expiring."
        ]
      },
      {
        title: 'The Debt Collector',
        description: 'Veteran demands a percentage of a rookie\'s winner\'s purse',
        isFresh: true,
        steps: [
          'Veteran presents a "Contract" from the rookie\'s training days',
          'Veteran sits at ringside and takes the rookie\'s bonus check from the timekeeper',
          'Rookie forced to wrestle extra matches to "pay off interest"',
          'The "Financial Freedom" Ladder match with the contract above the ring',
        ],
        promos: [
          'The "I Made You" history lesson.',
          'Backstage segment where the veteran takes the rookie\'s expensive watch as "partial payment".',
        ],
        key_lines: [
          "Every drop of sweat you shed belongs to me. I own the sweat, the blood, and the 15%.",
          "You wouldn't even be in this ring if I hadn't taught you how to tie your boots.",
          "IRS stands for 'I'm Really Superior'. Pay up, kid."
        ]
      },
      {
        title: 'The Contractual Hostage',
        description: 'Heel becomes the legal manager and forces demeaning chores',
        isFresh: true,
        steps: [
          'Face loses a match with a "Legal Proxy" stipulation',
          'Heel forces face to wax their car or carry their bags in the ring',
          'Face forced into 3-on-1 handicap matches by their "manager"',
          'The "Breach of Contract" match for the face\'s freedom',
        ],
        promos: [
          'The "Check the Fine Print" segment.',
          'Heel sipping champagne while the face scrubs the ring mat.',
        ],
        key_lines: [
          "You work for me now. If you touch me, you quit. And if you quit, you're blacklisted forever.",
          "I don't need a wrestler, I need a personal assistant who happens to take bumps.",
          "Don't look at the crowd. Look at the shoes you haven't polished yet."
        ]
      },
      {
        title: 'The Legacy Eraser',
        description: 'Veteran tries to legally "trademark" and delete a legend\'s history',
        isFresh: true,
        steps: [
          'Heel vandalizes a Hall of Fame display case',
          'Blurring out the legend\'s face in historical video packages',
          'Served with a Cease & Desist for using their own name',
          'The "Un-person" match where the loser is erased from the website',
        ],
        promos: [
          'The "History Is Written By The Winners" manifesto.',
          'Burning an old t-shirt of the legend in the ring center.',
        ],
        key_lines: [
          "You're not a legend. You're a footnote that I'm currently white-outting.",
          "I bought the rights to your nickname. Every time you say it, you owe me money.",
          "The future doesn't have a room for fossils like you. I'm the asteroid."
        ]
      },
      {
        title: 'The Social Media Clout Feud',
        description: 'Heel refuses to wrestle someone "not viral enough"',
        isFresh: true,
        steps: [
          'Heel refuses to get in the ring because the face "doesn\'t trend"',
          'Face has to perform viral stunts or win "qualifiers" for views',
          'Heel livestreams the entire match on their phone while wrestling',
          'The "Trending #1" match which is only viewable on social media',
        ],
        promos: [
          'The "Check Your Stats" roast.',
          'Comparing follower counts on the big screen.',
        ],
        key_lines: [
          "You have 10,000 followers. My cat has 2 million. I'll wrestle the cat first.",
          "I don't wrestle nobodies. Get a blue checkmark, then we talk.",
          "You're not a main eventer, you're an ad that people want to skip."
        ]
      },
      {
        title: 'The Sleep Agent',
        description: 'Psychological feud using trigger words to cause "blackouts"',
        isFresh: true,
        steps: [
          'Heel plays a specific frequency over the PA system',
          'Face suddenly freezes mid-match or attacks their own partner',
          'Face has no memory of the events, becoming paranoid and isolated',
          'The "Internal War" match inside an empty, dark arena',
        ],
        promos: [
          'The "Manchurian Candidate" reveal.',
          'Heel whispering the trigger word into a microphone backstage.',
        ],
        key_lines: [
          "I didn't make you do it. I just gave your subconscious permission to be yourself.",
          "When the bell rings, I own your mind. When the clock strikes, you belong to the dark.",
          "You're a weapon, and I'm the one with the safety off."
        ]
      },
      {
        title: 'The Ring Architect',
        description: 'Heel alters the ring environment every week for "home-court"',
        isFresh: true,
        steps: [
          'Shrinking the ring size by 4 feet for a match',
          'Removing all turnbuckle pads "for safety inspections"',
          'Adding a second set of ropes or a slanted ring floor',
          'The "Master Builder" match where the ring is a literal cage of logic',
        ],
        promos: [
          'The "Blueprint for Greatness" presentation.',
          'Heel measuring the ring with a laser tool while the face is talking.',
        ],
        key_lines: [
          "You can't adapt to the environment. I AM the environment.",
          "The standard ring is for standard wrestlers. I'm designing your defeat.",
          "Measurements don't lie. You're exactly 3 inches too slow for this layout."
        ]
      },
      {
        title: 'The Sponsorship Hijack',
        description: 'Heel ruins real-world endorsements and steals contracts',
        isFresh: true,
        steps: [
          'Heel ruins a commercial shoot for the babyface',
          'Getting a major endorsement contract moved to the heel\'s name',
          'Replacing the face\'s sponsored product with a gross alternative',
          'The "Logo On The Line" match for the sponsorship rights',
        ],
        promos: [
          'The "Brand Ambassador" takeover.',
          'Heel mocking the face while eating the face\'s sponsored food.',
        ],
        key_lines: [
          "They didn't want a hero. They wanted a face people actually want to look at.",
          "I'm the multi-million dollar brand. You're the clearance rack version.",
          "Consider this a corporate restructuring. You've been liquidated."
        ]
      },
      {
        title: 'The Record Breaker',
        description: 'Heel obsessed with obscure stats and avoiding specific moves',
        isFresh: true,
        steps: [
          'Heel wrestles entire match solely to avoid taking a vertical suplex',
          'Heel brings a statistician to ringside to track "Minutes Without Pain"',
          'Face tries every possible combination to land the "forbidden" move',
          'The "Final Stat" match: If the stat breaks, the heel retires',
        ],
        promos: [
          'The "Obscure History" lecture.',
          'Presenting a trophy for a fake, highly specific record.',
        ],
        key_lines: [
          "I haven't taken a suplex since 2018. Why would I let a peasant like you break the streak?",
          "Statistics are the only truth. And the truth is, you're a zero.",
          "Check the data. I'm literally untouchable in the third quarter of the match."
        ]
      },
      {
        title: 'The Fan Proxy',
        description: 'Heel lets a "disgruntled fan" call the strategy via headset',
        isFresh: true,
        steps: [
          'Heel brings a random fan (hired) to ringside to "oversee" the match',
          'Heel stops mid-match to take tactical advice from the fan',
          'The fan is given "General Manager" powers for one night',
          'The "Fan\'s Choice" match with a bizarre stipulations',
        ],
        promos: [
          'The "I\'m Wrestling For You" (mocking fans) segment.',
          'Heel letting the fan cut a promo on the babyface.',
        ],
        key_lines: [
          "I'm not the bad guy. This guy in row 4 says you suck, and I'm just his instrument.",
          "Everything I do is for the 'Universe'. Specifically, this one guy who paid for a front row seat.",
          "The fans are tired of you. [Fan Name] here has a much better plan for this brand."
        ]
      },
      {
        title: 'The Career Simulation',
        description: 'Young cocky heel treats WWE like a video game (E-sports style)',
        isFresh: true,
        steps: [
          'Heel complains about "button lag" after missing a move',
          'Treating the babyface like a "Level 1 NPC" or a "Tutorial Boss"',
          'Trying to "Save State" or "Restart" after losing a segment',
          'The "Final Boss" Hell in a Cell match',
        ],
        promos: [
          'The "Leveling Up" backstage montage.',
          'Heel using a controller during their entrance.',
        ],
        key_lines: [
          "You're just an NPC in my career mode. I'm the one holding the controller.",
          "I'm speedrunning this brand. You're just a cutscene I'm skipping.",
          "Git gud. Your stats are balanced for the mid-card, mine are meta-breaking."
        ]
      },
      {
        title: 'The Submission Monster',
        description: 'A giant who dismantles limbs with technical precision rather than power',
        isFresh: true,
        steps: [
          'Monster ignores a strike, focusing solely on an wrist-lock or ankle-pick',
          'Winning a squash match via a rare, complex technical submission',
          'Backstage "Anatomy Lesson" where they show how they will break the face',
          'The "Limb-on-the-Line" match with a specific target (e.g. left arm)',
        ],
        promos: [
          'The "Silence is Violent" slow-motion video package.',
          'Monster speaking in a calm, intellectual voice about joint manipulation.',
        ],
        key_lines: [
          "Gravity is a lie. Leverage is the only truth in this ring.",
          "I don't need to throw you. I just need one inch of your tendon.",
          "You think I'm a beast? No. I'm a surgeon, and the ring is my operating table."
        ]
      },
      {
        title: 'The Manager Auction',
        description: 'Two wrestlers compete for the exclusive rights to hire a world-class manager',
        isFresh: true,
        steps: [
          'Legendary manager enters free agency, sparking a bidding war',
          'Wrestlers try to "impress" the manager with their win-loss record',
          'Manager sets a series of "Trials" for both potential clients',
          'The "Signed Contract" match: Winner gets the manager, loser is banned from hiring anyone',
        ],
        promos: [
          'The "Portfolio Review" segment in the ring.',
          'Manager sitting on a throne at ringside, evaluating both wrestlers.',
        ],
        key_lines: [
          "I'm not a trophy. I'm the key to the main event. And you look like a mid-carder.",
          "Prove you can follow instructions for 10 minutes, and I'll make you a millionaire.",
          "This isn't about love. It's about ROI."
        ]
      },
      {
        title: 'Hard Times Bootcamp',
        description: 'Returning star tries to institute a 1980s-style bootcamp for "soft" talent',
        isFresh: true,
        steps: [
          'Returning star interrupts a locker room party, calling it "unprofessional"',
          'Forcing the locker room to do 500 squats before the show starts',
          'Attacking anyone using "fancy" modern wrestling flips',
          'The "Old School Rules" match: No mats, no pads, just "hard times"',
        ],
        promos: [
          'The "Locker Room has gone soft" rant.',
          'The "In my day..." history lesson that lasts way too long.',
        ],
        key_lines: [
          "You guys spent two hours on your hair and ten minutes on your bridge. Soft.",
          "The business didn't leave you. You left the business for a TikTok dance.",
          "I'm going to beat the 1980s back into your 2026 heart."
        ]
      },
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
      },
    ],
  },
];

export function StorylineGenerator() {
  const [storylines, setStorylines] = useState<Storyline[]>(() => {
    const saved = localStorage.getItem('wwe_storylines');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Heel Turn');
  const [templatePreference, setTemplatePreference] = useState<'Classic' | 'Fresh'>('Classic');
  const [selectedWrestlers, setSelectedWrestlers] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);

  // Roadmap Form State
  const [roadmapData, setRoadmapData] = useState({
    championId: '',
    duration: '3 Months',
    theme: 'Dominant Reign',
    feudCount: 3,
    feudPreference: 'Fresh' as 'Certain' | 'Fresh'
  });

  const wrestlers = rosterData as Wrestler[];

  const filteredWrestlers = useMemo(() => {
    return wrestlers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [wrestlers, searchTerm]);

  const saveStorylines = (newStorylines: Storyline[]) => {
    setStorylines(newStorylines);
    localStorage.setItem('wwe_storylines', JSON.stringify(newStorylines));
  };

  function suggestRival(type: 'Fresh' | 'Certain') {
    if (selectedWrestlers.length !== 1) return;
    const champ = wrestlers.find(w => w.id === selectedWrestlers[0]);
    if (!champ) return;

    let potential = wrestlers.filter(w => w.brand === champ.brand && w.id !== champ.id);

    if (type === 'Fresh') {
      potential = potential.filter(w => w.alignment !== champ.alignment);
    } else {
      potential = potential.filter(w => w.title || Math.random() > 0.5);
    }

    const rival = potential[Math.floor(Math.random() * potential.length)];
    if (rival) {
      setSelectedWrestlers([...selectedWrestlers, rival.id]);
    } else {
      alert("No suitable rival found in the current roster.");
    }
  }

  function generateStoryline() {
    if (selectedWrestlers.length === 0) {
      alert('Please select at least one superstar');
      return;
    }

    const typeTemplates = STORYLINE_TEMPLATES.find(t => t.type === selectedType);
    if (!typeTemplates) return;

    // Filter based on preference
    let available = typeTemplates.templates;
    if (templatePreference === 'Fresh') {
      available = available.filter(t => t.isFresh);
    } else if (templatePreference === 'Classic') {
      available = available.filter(t => !t.isFresh);
    }

    // If no filtered templates exist, fallback to any in category
    if (available.length === 0) available = typeTemplates.templates;

    const randomTemplate = available[Math.floor(Math.random() * available.length)];

    const participantNamesArray = selectedWrestlers.map(id => {
      const wrestler = wrestlers.find(w => w.id === id);
      return wrestler?.name || 'Unknown';
    });

    let customizedTitle = randomTemplate.title;
    let customizedDescription = randomTemplate.description;

    if (selectedWrestlers.length === 1) {
      const name = participantNamesArray[0];
      customizedTitle = `${randomTemplate.title}: ${name}`;
      customizedDescription = `${name} ${randomTemplate.description.toLowerCase()}`;
    } else if (selectedWrestlers.length >= 2) {
      const names = participantNamesArray.join(' & ');
      customizedTitle = `${randomTemplate.title}: ${names}`;
    }

    const newStoryline: Storyline = {
      id: Date.now().toString(),
      title: customizedTitle,
      description: customizedDescription,
      type: selectedType,
      participants: selectedWrestlers,
      execution_steps: randomTemplate.steps,
      promos: randomTemplate.promos,
      key_lines: randomTemplate.key_lines,
      isFresh: randomTemplate.isFresh,
      favorited: false,
      created_at: new Date().toISOString(),
    };

    saveStorylines([newStoryline, ...storylines]);
    setShowSaved(true);
    setSelectedWrestlers([]);
  }

  function generateLongTermRoadmap() {
    const champ = wrestlers.find(w => w.id === roadmapData.championId);
    if (!champ) {
      alert('Please select a superstar (champion) first');
      return;
    }

    const newRoadmaps: Storyline[] = [];
    const brandWrestlers = wrestlers.filter(w => w.brand === champ.brand && w.id !== champ.id);

    for (let i = 0; i < roadmapData.feudCount; i++) {
      let opponent: Wrestler | undefined;

      if (roadmapData.feudPreference === 'Fresh') {
        const potentialOpponents = brandWrestlers.filter(w => w.alignment !== champ.alignment);
        opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
      } else {
        opponent = brandWrestlers[Math.floor(Math.random() * brandWrestlers.length)];
      }

      if (!opponent) opponent = brandWrestlers[0];

      // Pick between Fresh and certain templates for the roadmap too
      const freshCat = STORYLINE_TEMPLATES.find(t => t.type === 'Fresh Feud')?.templates || [];
      const templates = roadmapData.feudPreference === 'Fresh' ? freshCat.filter(t => t.isFresh) : freshCat.filter(t => !t.isFresh);
      const template = (templates.length > 0 ? templates : freshCat)[Math.floor(Math.random() * (templates.length > 0 ? templates.length : freshCat.length))];

      if (template) {
        newRoadmaps.push({
          id: (Date.now() + i).toString(),
          title: `[Roadmap] ${champ.name} vs ${opponent.name} (${template.title})`,
          description: `Strategic booking for ${champ.name} during the ${roadmapData.duration} plan.`,
          type: 'Long-term Roadmap',
          participants: [champ.id, opponent.id],
          execution_steps: template.steps,
          promos: template.promos,
          key_lines: template.key_lines,
          isFresh: template.isFresh,
          favorited: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    saveStorylines([...newRoadmaps, ...storylines]);
    setShowSaved(true);
    setShowRoadmapForm(false);
    alert(`Generated ${roadmapData.feudCount}-phase roadmap for ${champ.name}!`);
  }

  function handleDelete(id: string) {
    saveStorylines(storylines.filter(s => s.id !== id));
  }

  function toggleFavorite(id: string) {
    saveStorylines(storylines.map(s => s.id === id ? { ...s, favorited: !s.favorited } : s));
  }

  function toggleWrestlerSelection(id: string) {
    setSelectedWrestlers(prev =>
      prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heel Turn': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Face Turn': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Fresh Feud': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Long-term Roadmap': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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
          <button
            onClick={() => setShowRoadmapForm(!showRoadmapForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-purple-600/50 text-purple-400 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            <Calendar className="w-5 h-5" />
            Roadmap Architect
          </button>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-600/20 active:scale-95"
          >
            <Star className={`w-5 h-5 ${showSaved ? 'fill-current' : ''}`} />
            {showSaved ? 'Back to Generator' : 'Saved Scripts'}
          </button>
        </div>
      </div>

      {showRoadmapForm && (
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-purple-500/50 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-500/20 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-400" /></div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Long-Term Booking Plan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Target Superstar</label>
              <select
                value={roadmapData.championId}
                onChange={(e) => setRoadmapData({ ...roadmapData, championId: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-600 outline-none shadow-inner"
              >
                <option value="">Select Talent</option>
                {wrestlers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.brand})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Booking Window</label>
              <select
                value={roadmapData.duration}
                onChange={(e) => setRoadmapData({ ...roadmapData, duration: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-600 outline-none shadow-inner"
              >
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="Road to WrestleMania">Road to WrestleMania</option>
                <option value="Post-Draft Reset">Post-Draft Reset</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Creative Narrative</label>
              <select
                value={roadmapData.theme}
                onChange={(e) => setRoadmapData({ ...roadmapData, theme: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-600 outline-none shadow-inner"
              >
                <option value="Dominant Reign">Dominant Reign</option>
                <option value="Heel Authority Force">Heel Authority Force</option>
                <option value="Heroic Redemption Arc">Heroic Redemption Arc</option>
                <option value="Struggle for Power">Struggle for Power</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Rivalry Allocation</label>
              <div className="flex gap-2">
                {(['Fresh', 'Certain'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setRoadmapData({ ...roadmapData, feudPreference: p })}
                    className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border ${roadmapData.feudPreference === p ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'}`}
                  >
                    {p} Rivals
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-gray-600 mt-1 italic pl-1">
                {roadmapData.feudPreference === 'Fresh' ? '* Deep cuts: Story-heavy, experimental concepts' : '* Blockbuster: Classic power-struggle rivalries'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">Feud Count</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRoadmapData({ ...roadmapData, feudCount: n })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${roadmapData.feudCount === n ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateLongTermRoadmap}
              className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95"
            >
              Initialize Grand Plan
            </button>
            <button
              onClick={() => setShowRoadmapForm(false)}
              className="px-10 py-5 bg-gray-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-gray-600 transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showSaved ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700 p-6 space-y-6 shadow-xl">
              <div className="space-y-4">
                <label className="text-gray-400 text-xs font-black uppercase tracking-widest pl-1">Storyline Category</label>
                <div className="grid grid-cols-1 gap-2">
                  {STORYLINE_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => setSelectedType(template.type)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all border ${selectedType === template.type
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg translate-x-1'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-500/50'
                        }`}
                    >
                      {template.type}
                      <ChevronRight className={`w-4 h-4 ${selectedType === template.type ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-700">
                <label className="text-gray-400 text-xs font-black uppercase tracking-widest pl-1">Creativity Style</label>
                <div className="flex gap-2">
                  {(['Classic', 'Fresh'] as const).map(pref => (
                    <button
                      key={pref}
                      onClick={() => setTemplatePreference(pref)}
                      className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border ${templatePreference === pref
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-500/20'
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateStoryline}
                disabled={selectedWrestlers.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black uppercase tracking-widest hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl disabled:opacity-30 active:scale-95 mt-4"
              >
                <RefreshCw className="w-5 h-5" />
                Produce Script
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700 p-6 shadow-xl h-full">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <label className="text-gray-400 text-xs font-black uppercase tracking-widest pl-1 block">Superstar Selection ({selectedWrestlers.length})</label>
                  {selectedWrestlers.length === 1 && (
                    <div className="flex gap-4 mt-2 animate-in slide-in-from-left-2">
                      <button
                        onClick={() => suggestRival('Fresh')}
                        className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors border border-blue-500/30 px-2 py-1 rounded bg-blue-500/5 shadow-sm"
                      >
                        <Zap className="w-3 h-3" /> Fresh Rival
                      </button>
                      <button
                        onClick={() => suggestRival('Certain')}
                        className="flex items-center gap-1.5 text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-white transition-colors border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/5 shadow-sm"
                      >
                        <TrendingUp className="w-3 h-3" /> Certain (Top) Rival
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search talent..."
                    className="w-full sm:w-64 bg-gray-900 border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 shadow-inner"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredWrestlers.map((wrestler) => (
                  <button
                    key={wrestler.id}
                    onClick={() => toggleWrestlerSelection(wrestler.id)}
                    className={`relative p-3 rounded-xl border transition-all text-left overflow-hidden ${selectedWrestlers.includes(wrestler.id)
                      ? 'bg-purple-600/20 border-purple-500 shadow-xl'
                      : 'bg-gray-900/50 border-gray-800 hover:border-purple-500/30'
                      }`}
                  >
                    <div className="relative z-10">
                      <p className={`text-xs font-black uppercase tracking-tighter truncate ${selectedWrestlers.includes(wrestler.id) ? 'text-white' : 'text-gray-300'}`}>
                        {wrestler.name}
                      </p>
                      <p className={`text-[9px] font-bold uppercase ${selectedWrestlers.includes(wrestler.id) ? 'text-purple-300' : 'text-gray-600'}`}>{wrestler.brand} • {wrestler.alignment}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {storylines.length === 0 ? (
            <div className="xl:col-span-2 text-center py-40 bg-gray-800/10 rounded-[3rem] border border-gray-700/50 border-dashed">
              <Sparkles className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-30" />
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">Script Vault Empty</h3>
              <p className="text-gray-500 mt-2 font-medium bg-gray-900/50 px-4 py-1 rounded-full inline-block">Draft a masterpiece to begin your legacy</p>
            </div>
          ) : (
            storylines.map((storyline) => (
              <StorylineCard
                key={storyline.id}
                storyline={storyline}
                wrestlers={wrestlers}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
                getTypeColor={getTypeColor}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StorylineCard({ storyline, wrestlers, onDelete, onToggleFavorite, getTypeColor }: any) {
  const participants = storyline.participants.map((id: string) => wrestlers.find((w: any) => w.id === id)).filter(Boolean);

  const getStorylineIcon = () => {
    if (storyline.isFresh) return <Sparkles className="w-4 h-4 text-indigo-400" />;
    return <Zap className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className={`group relative bg-gray-800/40 backdrop-blur-sm border rounded-[2rem] p-8 hover:border-purple-500/50 transition-all flex flex-col h-full shadow-2xl ${storyline.isFresh ? 'border-indigo-500/30' : 'border-gray-700/50'}`}>
      {storyline.isFresh && (
        <div className="absolute top-4 right-20 bg-indigo-600/20 border border-indigo-500 px-2 py-0.5 rounded-lg">
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Experimental</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border shadow-sm ${getTypeColor(storyline.type)}`}>
              {storyline.type}
            </span>
            {storyline.favorited && (
              <div className="p-1 px-2 bg-yellow-500/10 rounded-lg flex items-center gap-1 border border-yellow-500/20">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-[8px] font-black text-yellow-500 uppercase font-mono">Archive</span>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none transition-colors">{storyline.title}</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onToggleFavorite(storyline.id)} className="p-3 bg-gray-950 border border-gray-700 rounded-2xl hover:text-yellow-400 transition-all shadow-lg active:scale-90">
            <Star className={`w-4 h-4 ${storyline.favorited ? 'fill-current text-yellow-500' : ''}`} />
          </button>
          <button onClick={() => onDelete(storyline.id)} className="p-3 bg-gray-950 border border-gray-700 rounded-2xl hover:text-red-500 transition-all shadow-lg active:scale-90">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-400 text-sm italic font-medium border-l-2 border-indigo-500/50 pl-4 py-1">"{storyline.description}"</p>
      </div>

      {participants.length > 0 && (
        <div className="flex items-center gap-3 mb-8">
          <div className="flex -space-x-3 overflow-hidden">
            {participants.map((p: any) => (
              <div key={p.id} className="relative w-12 h-12 rounded-2xl border-4 border-gray-950 bg-gray-900 shadow-xl overflow-hidden group/thumb" title={p.name}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-all" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-800">{p.name[0]}</div>
                )}
              </div>
            ))}
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{participants.length} Cast Members</p>
        </div>
      )}

      <div className="space-y-6 mt-auto">
        <div className="bg-gray-950/50 rounded-3xl p-6 border border-gray-800 shadow-inner">
          <h4 className="flex items-center gap-2 text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-4">
            {getStorylineIcon()} Booking Strategy
          </h4>
          <div className="space-y-4">
            {storyline.execution_steps.map((step: string, i: number) => (
              <div key={i} className="flex gap-4 items-start group">
                <span className="text-sm font-black text-gray-700 italic group-hover:text-purple-500 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {(storyline.promos || storyline.key_lines) && (
          <div className="bg-gray-900/60 rounded-3xl p-6 border border-gray-800 space-y-6 shadow-sm">
            {storyline.promos && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                  <MessageSquare className="w-4 h-4" /> Script Beats
                </h4>
                <ul className="space-y-2">
                  {storyline.promos.map((promo: string, i: number) => (
                    <li key={i} className="text-[11px] text-gray-400 italic flex gap-3">
                      <span className="text-blue-500/50 font-black">•</span>
                      <span>{promo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {storyline.key_lines && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">
                  <Sparkles className="w-4 h-4" /> Dialogue Hits
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {storyline.key_lines.map((line: string, i: number) => (
                    <div key={i} className="relative group/line">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-xl opacity-0 group-hover/line:opacity-100 transition-opacity" />
                      <p className="relative text-[11px] text-white font-black italic bg-gray-950 p-3 rounded-xl border border-gray-800 border-l-yellow-500/80 leading-relaxed shadow-sm">
                        "{line}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
