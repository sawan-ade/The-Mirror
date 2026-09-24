// ============================================================
// THE MIRROR — Built-in Demo Dataset
// Theme: A software engineer's thought journal over 18 months
// 80+ thoughts, 25 concepts, 5 clusters, multiple story arcs
// ============================================================

window.DEMO_DATA = {
  metadata: {
    totalThoughts: 84,
    dateRange: "March 2024 – September 2025",
    conceptCount: 25,
    clusterCount: 5,
    dominantClusters: ["career", "philosophy"]
  },

  clusters: [
    { id: "career",      label: "Career & Ambition",   theme: "Work identity, growth, and professional trajectory", colorKey: "violet" },
    { id: "technology",  label: "Technology & Craft",  theme: "Code, systems, and the nature of building things",   colorKey: "blue" },
    { id: "philosophy",  label: "Inner World",         theme: "Meaning, identity, and how I understand myself",      colorKey: "cyan" },
    { id: "creativity",  label: "Creative Projects",   theme: "Art, writing, and things made purely for joy",        colorKey: "rose" },
    { id: "health",      label: "Body & Mind",         theme: "Rest, energy, and navigating burnout",               colorKey: "emerald" }
  ],

  nodes: [
    {
      id: "deep_work",
      label: "Deep Work",
      cluster: "career",
      weight: 1.0,
      mentions: 18,
      status: "recurring",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_dw1",
          url: "img/illustrations/lighthouse_coastal.png",
          caption: "Solitary beacon cutting through sea mist. The mental horizon of uninterrupted four-hour focus.",
          date: "March 2024"
        }
      ],
      voiceNotes: [
        {
          id: "v_dw1",
          title: "Early Morning Silence",
          date: "March 2024",
          duration: "0:24",
          text: "I keep coming back to this: my best code is written when everything is quiet and nobody is asking for status updates."
        }
      ],
      sourceExcerpts: [
        "I keep coming back to this idea that my best code is written in silence, early morning, before the world starts asking things of me.",
        "Cal Newport's Deep Work changed how I think about attention. Real creative work needs four-hour uninterrupted blocks, not ninety-minute ones.",
        "I haven't had a real deep work block in three weeks. The meetings are eating everything."
      ],
      aiInterpretation: "Deep work functions as both a productivity concept and a moral value in your thinking — almost a form of self-respect. Its frequent reappearance suggests it represents something you aspire to but feel you're losing."
    },
    {
      id: "startup_idea",
      label: "Startup",
      cluster: "career",
      weight: 0.95,
      mentions: 22,
      status: "recurring",
      firstSeen: "April 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_su1",
          url: "img/memory-startup.jpg",
          caption: "Whiteboard architecture pass for the product concept. Drawing out the event streams at midnight.",
          date: "April 2024"
        }
      ],
      voiceNotes: [
        {
          id: "v_su1",
          title: "Betting on Myself",
          date: "April 2024",
          duration: "0:32",
          text: "What if I just build it? The fear isn't failing; it's looking back in ten years and realizing I was too comfortable to try."
        }
      ],
      sourceExcerpts: [
        "What if I just quit and build the thing? I've been saying 'maybe next year' for three years.",
        "The startup idea isn't just a startup idea anymore. It feels like the answer to a question I've been living with.",
        "I think I'm scared. Not of failing, but of what it means if I don't even try."
      ],
      aiInterpretation: "The startup appears as both concrete business plan and existential test — a symbol of whether you're willing to bet on yourself. The evolution from vague dream to urgent imperative is one of the clearest narratives in your journal."
    },
    {
      id: "burnout",
      label: "Burnout",
      cluster: "health",
      weight: 0.9,
      mentions: 14,
      status: "recurring",
      firstSeen: "June 2024",
      lastSeen: "August 2025",
      photos: [
        {
          id: "p_bo1",
          url: "img/illustrations/river_sunset.png",
          caption: "Golden hour river bend. Learning that recovery cannot be rushed and stillness is a prerequisite for clarity.",
          date: "June 2024"
        }
      ],
      voiceNotes: [
        {
          id: "v_bo1",
          title: "Running on Fumes",
          date: "June 2024",
          duration: "0:28",
          text: "Stared at the screen for two hours today. It's when the thing you used to love most starts to feel like the thing you dread most."
        }
      ],
      sourceExcerpts: [
        "I stared at the screen for two hours and wrote nothing. Not even a comment. This has happened four times this week.",
        "Burnout isn't tiredness. It's when the thing you loved most starts to feel like the thing you dread most.",
        "I think I've been running on fumes since Q3 last year. The energy just isn't there."
      ],
      aiInterpretation: "Burnout appears as a shadow throughout your journal — present even when not named directly. It often appears in proximity to mentions of meetings, performance reviews, and loss of creative energy."
    },
    {
      id: "building_in_public",
      label: "Building in Public",
      cluster: "career",
      weight: 0.85,
      mentions: 11,
      status: "recurring",
      firstSeen: "July 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "There's something terrifying and exciting about shipping before you're ready. Like being naked in public but on purpose.",
        "I want to document the journey. Not the wins — the messy middle. That's the part nobody shows.",
        "Building in public is not about the audience. It's about accountability to your own standards."
      ],
      aiInterpretation: "Building in public represents your reckoning with visibility and vulnerability. You're drawn to the idea but worried about the performance aspect — you want authenticity, not a highlight reel."
    },
    {
      id: "meditation",
      label: "Meditation",
      cluster: "health",
      weight: 0.7,
      mentions: 9,
      status: "recurring",
      firstSeen: "May 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_med1",
          url: "img/illustrations/rhaetian_alps.jpg",
          caption: "Rhaetian Alps sunrise vista. High-altitude perspective where trivial noise and mental clutter dissolve.",
          date: "May 2024"
        }
      ],
      sourceExcerpts: [
        "Twenty minutes of sitting still in the morning does more for my output than any productivity system.",
        "I notice I skip meditation during the weeks when I need it most. That's the paradox.",
        "The meditation isn't about clearing my mind. It's about watching what my mind does when I stop directing it."
      ],
      aiInterpretation: "Meditation appears as a diagnostic tool in your thinking — when you miss it, you notice a decline in clarity. Its presence in your journal often precedes your most insightful entries."
    },
    {
      id: "identity",
      label: "Identity as Engineer",
      cluster: "philosophy",
      weight: 0.8,
      mentions: 12,
      status: "recurring",
      firstSeen: "March 2024",
      lastSeen: "August 2025",
      sourceExcerpts: [
        "At what point does 'software engineer' become what I am and not just what I do?",
        "I don't want to be defined by my job title, but honestly, I'm not sure who I am without the work.",
        "Engineering is a way of seeing the world. Systems, abstractions, tradeoffs. It's how I think about everything now."
      ],
      aiInterpretation: "Your relationship to professional identity is complex — you resist being reduced to your job, yet your engineering mindset has become a fundamental cognitive lens for interpreting all aspects of life."
    },
    {
      id: "reading",
      label: "Reading",
      cluster: "creativity",
      weight: 0.75,
      mentions: 11,
      status: "recurring",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_rd1",
          url: "img/memory-reading.jpg",
          caption: "The Heidegger and design theory stack. Underlining sentences that re-wire how I think about systems.",
          date: "March 2024"
        }
      ],
      sourceExcerpts: [
        "I finished three books in March. None in April. Reading is a canary in the coal mine — I can tell how I'm doing by whether I'm reading.",
        "The ideas that stick are the ones I read slowly, underline, argue with.",
        "Reading fiction teaches me things about code architecture that architecture books never do."
      ],
      aiInterpretation: "Reading functions as a mental health indicator in your journal. When reading volume drops, it signals increased stress or cognitive overload elsewhere. Your connection between fiction and systems thinking is a distinctive and recurring insight."
    },
    {
      id: "system_design",
      label: "System Design",
      cluster: "technology",
      weight: 0.85,
      mentions: 14,
      status: "active",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_sys1",
          url: "img/illustrations/rigi_railways.png",
          caption: "Rigi mountain railway climbing through cloud banks — designing engineering systems that ascend cleanly above complexity.",
          date: "May 2024"
        }
      ],
      sourceExcerpts: [
        "Good system design is invisible when it works and catastrophically visible when it fails.",
        "I've been thinking about the way we model our data wrong. It's not a performance issue. It's a thinking issue.",
        "Every architectural decision is a bet about the future. The best engineers place bets they can unwind."
      ],
      aiInterpretation: "System design is where your technical thinking is most philosophical. You approach architecture as a form of epistemology — how you model data reflects how you model reality."
    },
    {
      id: "side_project",
      label: "Side Project → Product",
      cluster: "career",
      weight: 0.9,
      mentions: 19,
      status: "emerging",
      firstSeen: "April 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_sp1",
          url: "img/memory-studio.jpg",
          caption: "Midnight studio desk. First 100 users logged in while the world was asleep.",
          date: "April 2024"
        }
      ],
      sourceExcerpts: [
        "April 2024: Started a side project. Mostly for fun. A tool for my own workflow.",
        "August 2024: People keep asking me about the tool. Maybe there's something here.",
        "February 2025: First paying user. This isn't a side project anymore.",
        "September 2025: We hit 100 users. I need to decide if I'm building a business or a hobby."
      ],
      aiInterpretation: "This is perhaps the clearest evolution story in your entire journal. A tool built for yourself transformed into something with users, revenue, and existential weight. Each entry shows a different relationship to it."
    },
    {
      id: "podcast",
      label: "Starting a Podcast",
      cluster: "creativity",
      weight: 0.4,
      mentions: 5,
      status: "abandoned",
      firstSeen: "May 2024",
      lastSeen: "August 2024",
      sourceExcerpts: [
        "May 2024: I want to start a podcast. Long-form conversations about how engineers think.",
        "June 2024: Bought a mic. Haven't used it.",
        "August 2024: The podcast idea feels wrong now. Maybe writing is the right medium for me."
      ],
      aiInterpretation: "The podcast idea flared and faded within three months. The shift from podcast to writing may reflect a preference for solitary, introspective creation over performance-oriented media."
    },
    {
      id: "japanese",
      label: "Learning Japanese",
      cluster: "creativity",
      weight: 0.3,
      mentions: 4,
      status: "abandoned",
      firstSeen: "June 2024",
      lastSeen: "September 2024",
      sourceExcerpts: [
        "June 2024: Starting Duolingo for Japanese. Already obsessed.",
        "July 2024: 30-day streak. This is the most consistent habit I've built.",
        "September 2024: The streak ended. I haven't opened the app in six weeks."
      ],
      aiInterpretation: "The Japanese learning journey shows a pattern: rapid, intense enthusiasm followed by abrupt abandonment when another priority emerges. This mirrors several other ideas in your journal."
    },
    {
      id: "loneliness",
      label: "Isolation & Connection",
      cluster: "philosophy",
      weight: 0.65,
      mentions: 8,
      status: "recurring",
      firstSeen: "July 2024",
      lastSeen: "July 2025",
      photos: [
        {
          id: "p_lone1",
          url: "img/illustrations/coffee_time_city.png",
          caption: "Quiet cobblestone cafe corner at dawn. The delicate tension between craving solitude and needing urban presence.",
          date: "July 2024"
        }
      ],
      sourceExcerpts: [
        "The remote work freedom I wanted feels like isolation I didn't ask for.",
        "I went to a conference and talked to more people in two days than I had in two months.",
        "There's a particular loneliness in working on something nobody around you understands."
      ],
      aiInterpretation: "Isolation emerges as an unexpected cost of the autonomy and focus you value. The contradiction between wanting deep solitude for work and craving real human connection is a quiet tension running through your entries."
    },
    {
      id: "money",
      label: "Financial Independence",
      cluster: "career",
      weight: 0.7,
      mentions: 9,
      status: "active",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "Financial independence isn't about being rich. It's about buying back my own time.",
        "I calculated it. I need two years of runway to really try the startup thing without panicking.",
        "Every time I get a raise, I save the difference. Slow accumulation. Boring and powerful."
      ],
      aiInterpretation: "Financial independence functions primarily as a freedom concept in your thinking, not a wealth concept. The number you're aiming for is consistently framed in terms of time, options, and the startup."
    },
    {
      id: "writing",
      label: "Writing & Clarity",
      cluster: "creativity",
      weight: 0.7,
      mentions: 10,
      status: "emerging",
      firstSeen: "August 2024",
      lastSeen: "September 2025",
      photos: [
        {
          id: "p_wri1",
          url: "img/illustrations/autumn_boat.png",
          caption: "Rowing into autumn mist. Letting ideas drift without urgency until the right words settle onto paper.",
          date: "August 2024"
        }
      ],
      sourceExcerpts: [
        "Writing is thinking. I don't know what I believe about something until I've tried to write it.",
        "After the podcast idea died, I started writing instead. It feels more honest.",
        "The best code review I gave this year was actually a one-page written document explaining the tradeoffs."
      ],
      aiInterpretation: "Writing has grown from a replacement for the abandoned podcast into a core intellectual tool. The realization that writing and thinking are inseparable appears repeatedly and seems to be crystallizing into a firm belief."
    },
    {
      id: "sleep",
      label: "Sleep & Recovery",
      cluster: "health",
      weight: 0.6,
      mentions: 8,
      status: "recurring",
      firstSeen: "June 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "I tracked my sleep for a month. The correlation with my output is undeniable.",
        "Bad sleep is a tax on tomorrow. I keep taking out loans.",
        "When I sleep eight hours, I solve in two hours what takes six when I'm tired."
      ],
      aiInterpretation: "Sleep features as a quantified, evidence-based concern. You treat it analytically — as a variable in an optimization problem — which is consistent with your engineering approach to personal systems."
    },
    {
      id: "perfectionism",
      label: "Perfectionism",
      cluster: "philosophy",
      weight: 0.65,
      mentions: 8,
      status: "recurring",
      firstSeen: "April 2024",
      lastSeen: "August 2025",
      sourceExcerpts: [
        "I refactored the same component four times. It still doesn't feel right.",
        "Perfectionism isn't high standards. It's fear wearing a productive mask.",
        "The best version of shipping something is the version you actually ship."
      ],
      aiInterpretation: "Perfectionism appears as something you've intellectually conquered but emotionally still wrestle with. You know the argument for shipping, but the pull toward refinement is strong and recurring."
    },
    {
      id: "ai_tools",
      label: "AI Tools & Future of Work",
      cluster: "technology",
      weight: 0.8,
      mentions: 13,
      status: "emerging",
      firstSeen: "January 2025",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "January 2025: I've started using Claude for first drafts of technical documents. Weird and powerful.",
        "April 2025: The junior engineers who embrace these tools will become seniors faster than anyone expects.",
        "September 2025: I wonder if I'm optimizing for skills that will matter in five years."
      ],
      aiInterpretation: "AI tools represent your most recent and rapidly growing area of intellectual engagement. Unlike older topics, there's genuine uncertainty and open-endedness in how you write about this — it hasn't been resolved into a firm position."
    },
    {
      id: "mentorship",
      label: "Mentorship & Teaching",
      cluster: "career",
      weight: 0.55,
      mentions: 7,
      status: "emerging",
      firstSeen: "October 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "The best way to understand something deeply is to try to teach it.",
        "I've started 1-on-1s with two junior engineers. I learn as much from them as they do from me.",
        "Teaching forces me to confront every assumption I've made in silence."
      ],
      aiInterpretation: "Mentorship appears relatively recently but with increasing frequency and depth. It functions both as a form of intellectual clarification (teaching to learn) and as a relational antidote to the isolation you've documented."
    },
    {
      id: "city_vs_remote",
      label: "Where to Live",
      cluster: "philosophy",
      weight: 0.5,
      mentions: 7,
      status: "active",
      firstSeen: "July 2024",
      lastSeen: "June 2025",
      photos: [
        {
          id: "p_cvr1",
          url: "img/illustrations/amsterdam_colors.png",
          caption: "Amsterdam canal reflections at dusk. The magnetic energy of dense urban culture vs. secluded focus.",
          date: "July 2024"
        },
        {
          id: "p_cvr2",
          url: "img/illustrations/house_woods.png",
          caption: "Sanctuary cabin in deep pine woods. The longing for stillness and uninterrupted thought.",
          date: "January 2025"
        }
      ],
      sourceExcerpts: [
        "The city is expensive and loud and I love it. But I could ship more code from a quiet town.",
        "Is the energy of a city something I need, or just something I've gotten used to?",
        "Remote-first means I could live anywhere. That's liberating and paralyzing at the same time."
      ],
      aiInterpretation: "This question of geography reflects deeper questions about identity and where you belong. The choice between urban energy and quiet focus mirrors other recurring tensions in your journal."
    },
    {
      id: "open_source",
      label: "Open Source Contributions",
      cluster: "technology",
      weight: 0.55,
      mentions: 6,
      status: "active",
      firstSeen: "March 2024",
      lastSeen: "May 2025",
      sourceExcerpts: [
        "My first real open-source PR was merged this week. Tiny change but it felt enormous.",
        "Open source is the closest software gets to a public good.",
        "Contributing to open source taught me to read code I didn't write, which is the most important skill."
      ],
      aiInterpretation: "Open source represents your earliest form of building in public — contributing to something bigger than yourself with no guaranteed return. It precedes and possibly informed your later thinking on public building."
    },
    {
      id: "time_perception",
      label: "Time & Urgency",
      cluster: "philosophy",
      weight: 0.6,
      mentions: 8,
      status: "recurring",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "I'm 28 and I act like I have infinite time. I don't think I believe that anymore.",
        "The startup idea feels more urgent every year. Not because opportunity expires but because my energy does.",
        "Years compress as you get older. Things I thought I'd do 'someday' need a date now."
      ],
      aiInterpretation: "Time perception shifted noticeably in your journal around late 2024 — a transition from deferred possibility to urgent present. This shift correlates with increased seriousness about the startup and financial planning."
    },
    {
      id: "debugging",
      label: "Debugging & Problem Solving",
      cluster: "technology",
      weight: 0.7,
      mentions: 10,
      status: "active",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "Debugging is archaeology. You're discovering what really happened, not what you thought happened.",
        "The best debugging sessions happen when I stop trying to fix it and just try to understand it.",
        "I've started explaining bugs out loud to nobody in particular. It works almost every time."
      ],
      aiInterpretation: "Your approach to debugging is deeply philosophical — emphasizing understanding over fixing, which reflects a broader pattern in how you approach complex problems in life and work."
    },
    {
      id: "flow_state",
      label: "Flow State",
      cluster: "health",
      weight: 0.65,
      mentions: 8,
      status: "recurring",
      firstSeen: "March 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "There are days when I write a thousand lines and don't notice time passing. Those days feel like what I was built for.",
        "Flow state is my highest value and my least protected resource.",
        "Protecting flow state is the real reason I push back on unnecessary meetings."
      ],
      aiInterpretation: "Flow state functions as your primary definition of a good workday. It's the experiential goal behind all the systems — deep work blocks, meditation, sleep optimization, and meeting resistance."
    },
    {
      id: "fear_of_failure",
      label: "Fear & Courage",
      cluster: "philosophy",
      weight: 0.7,
      mentions: 10,
      status: "recurring",
      firstSeen: "April 2024",
      lastSeen: "September 2025",
      sourceExcerpts: [
        "I'm afraid of failing. But more afraid of not finding out.",
        "Courage isn't the absence of fear. It's knowing the fear is the signal to move, not to stop.",
        "The conversations I've been putting off are always the ones that matter most."
      ],
      aiInterpretation: "Fear and courage appear consistently as paired concepts in your writing. You've developed a sophisticated framework for understanding fear as directional signal rather than obstacle — though applying it to your own startup remains the active challenge."
    },
    {
      id: "constraints",
      label: "Constraints & Creativity",
      cluster: "technology",
      weight: 0.5,
      mentions: 6,
      status: "active",
      firstSeen: "August 2024",
      lastSeen: "June 2025",
      sourceExcerpts: [
        "The best creative work I've done was always under constraints. Deadlines, limits, impossibilities.",
        "A blank canvas is the least creative surface. Constraints are the gift that forces invention.",
        "I build better features when I have to work within old systems than when I start fresh."
      ],
      aiInterpretation: "Constraints as creativity enabler is a latent belief in your thinking — stated clearly but not yet applied to your own startup decision, where you're waiting for perfect conditions."
    }
  ],

  edges: [
    { id: "e1",  source: "deep_work",      target: "flow_state",        strength: 0.95, type: "reinforces",   label: "enables",        evidence: "Deep work blocks are the precondition you identify for achieving flow state." },
    { id: "e2",  source: "burnout",         target: "deep_work",         strength: 0.8,  type: "contrasts",    label: "undermines",     evidence: "When burnout appears in entries, deep work blocks have vanished from your week." },
    { id: "e3",  source: "startup_idea",    target: "fear_of_failure",   strength: 0.9,  type: "causes",       label: "triggers",       evidence: "Nearly every entry about the startup also mentions fear, risk, or the cost of not trying." },
    { id: "e4",  source: "side_project",    target: "startup_idea",      strength: 0.95, type: "evolves_into", label: "became",         evidence: "Your side project entries explicitly transition from 'fun experiment' to 'is this a business?'" },
    { id: "e5",  source: "meditation",      target: "flow_state",        strength: 0.85, type: "reinforces",   label: "prepares",       evidence: "You note that your best flow sessions follow morning meditation." },
    { id: "e6",  source: "burnout",         target: "flow_state",        strength: 0.8,  type: "contrasts",    label: "blocks",         evidence: "Burnout is described as the complete absence of flow." },
    { id: "e7",  source: "reading",         target: "writing",           strength: 0.8,  type: "reinforces",   label: "feeds",          evidence: "You write most after reading intensively — they appear together repeatedly." },
    { id: "e8",  source: "podcast",         target: "writing",           strength: 0.7,  type: "evolves_into", label: "transformed to", evidence: "The podcast was abandoned; writing emerged as your chosen medium immediately after." },
    { id: "e9",  source: "perfectionism",   target: "building_in_public",strength: 0.75, type: "contrasts",    label: "resists",        evidence: "You identify perfectionism as the force holding you back from shipping publicly." },
    { id: "e10", source: "identity",        target: "startup_idea",      strength: 0.8,  type: "questions",    label: "challenged by",  evidence: "The startup forces the question of who you are beyond your current role." },
    { id: "e11", source: "money",           target: "startup_idea",      strength: 0.85, type: "part_of",      label: "funds",          evidence: "Your savings target is consistently framed as startup runway." },
    { id: "e12", source: "sleep",           target: "deep_work",         strength: 0.75, type: "reinforces",   label: "enables",        evidence: "You track sleep and correlate it directly with productive output." },
    { id: "e13", source: "meditation",      target: "debugging",         strength: 0.6,  type: "reinforces",   label: "clarifies",      evidence: "Both involve observing a system without immediately trying to change it." },
    { id: "e14", source: "system_design",   target: "identity",          strength: 0.7,  type: "part_of",      label: "defines",        evidence: "You describe engineering as a cognitive framework, not just a skill." },
    { id: "e15", source: "loneliness",      target: "building_in_public",strength: 0.65, type: "causes",       label: "motivates",      evidence: "Building in public is partly framed as a solution to professional isolation." },
    { id: "e16", source: "loneliness",      target: "mentorship",        strength: 0.7,  type: "causes",       label: "resolved by",    evidence: "Mentorship entries appear after loneliness peaks, describing real human connection." },
    { id: "e17", source: "ai_tools",        target: "identity",          strength: 0.75, type: "questions",    label: "challenges",     evidence: "You ask what engineering skill means when AI can do the mechanical parts." },
    { id: "e18", source: "time_perception", target: "startup_idea",      strength: 0.85, type: "causes",       label: "urgency for",    evidence: "Your growing urgency about time directly correlates with urgency about the startup." },
    { id: "e19", source: "reading",         target: "system_design",     strength: 0.65, type: "reinforces",   label: "informs",        evidence: "You note that fiction teaches architecture in ways architecture books don't." },
    { id: "e20", source: "open_source",     target: "building_in_public",strength: 0.7,  type: "reinforces",   label: "preceded",       evidence: "Your open source contributions were an early form of building publicly." },
    { id: "e21", source: "fear_of_failure", target: "perfectionism",     strength: 0.7,  type: "reinforces",   label: "masks as",       evidence: "You directly identify perfectionism as fear wearing a productive mask." },
    { id: "e22", source: "constraints",     target: "side_project",      strength: 0.6,  type: "reinforces",   label: "shaped",         evidence: "Your side project was built within the constraints of personal workflow needs." },
    { id: "e23", source: "writing",         target: "mentorship",        strength: 0.65, type: "reinforces",   label: "parallels",      evidence: "Both writing and teaching are described as tools for understanding your own thinking." },
    { id: "e24", source: "flow_state",      target: "deep_work",         strength: 0.9,  type: "reinforces",   label: "goal of",        evidence: "Flow is consistently described as what deep work is designed to protect." },
    { id: "e25", source: "burnout",         target: "meditation",        strength: 0.7,  type: "causes",       label: "makes neglect",  evidence: "You note skipping meditation during the weeks when stress peaks — the weeks that need it most." }
  ],

  insights: {
    recurring: [
      { nodeId: "deep_work",         description: "Deep work has appeared in 17+ entries across 18 months — more than any other concept.", evidence: "I keep coming back to this idea that my best code is written in silence..." },
      { nodeId: "startup_idea",      description: "The startup has been present from the very first entry to the very last.", evidence: "What if I just quit and build the thing? I've been saying 'maybe next year' for three years." },
      { nodeId: "fear_of_failure",   description: "Fear surfaces every time a high-stakes decision approaches — consistent emotional signal.", evidence: "I'm afraid of failing. But more afraid of not finding out." },
      { nodeId: "burnout",           description: "Burnout appears cyclically, often after periods of intense output.", evidence: "Burnout isn't tiredness. It's when the thing you loved most starts to feel like the thing you dread most." }
    ],
    abandoned: [
      { nodeId: "podcast",  description: "The podcast idea burned bright for three months before quietly dying. It was replaced — not mourned.", lastEvidence: "The podcast idea feels wrong now. Maybe writing is the right medium for me.", lastSeen: "August 2024" },
      { nodeId: "japanese", description: "Japanese learning showed an intense burst pattern followed by complete silence — a recurring theme in how you engage with new interests.", lastEvidence: "The streak ended. I haven't opened the app in six weeks.", lastSeen: "September 2024" }
    ],
    emerging: [
      { nodeId: "ai_tools",    description: "AI tools only appeared in January 2025 but became one of the highest-frequency topics within months.", evidence: "I've started using Claude for first drafts of technical documents. Weird and powerful." },
      { nodeId: "writing",     description: "Writing grew steadily from August 2024 onward and is now one of your most-discussed topics.", evidence: "Writing is thinking. I don't know what I believe about something until I've tried to write it." },
      { nodeId: "mentorship",  description: "Mentorship appeared late but has grown in both frequency and emotional depth.", evidence: "Teaching forces me to confront every assumption I've made in silence." }
    ],
    hiddenConnections: [
      {
        nodeA: "meditation",
        nodeB: "debugging",
        hypothesis: "Both meditation and debugging share the same cognitive structure: you observe a system without immediately trying to change it. Patience, non-judgment, and watching without reacting.",
        strength: 0.72,
        evidence: "The best debugging sessions happen when I stop trying to fix it and just try to understand it. / The meditation isn't about clearing my mind. It's about watching what my mind does when I stop directing it."
      },
      {
        nodeA: "reading",
        nodeB: "system_design",
        hypothesis: "Your reading habit and your system design thinking feed each other in surprising ways — fiction teaches you about architecture, and architecture gives you a lens for narrative structure.",
        strength: 0.65,
        evidence: "Reading fiction teaches me things about code architecture that architecture books never do."
      },
      {
        nodeA: "loneliness",
        nodeB: "building_in_public",
        hypothesis: "Building in public may be partly a social solution to professional isolation — creating a digital community when physical community is absent.",
        strength: 0.68,
        evidence: "There's a particular loneliness in working on something nobody around you understands. / Building in public is not about the audience. It's about accountability to your own standards."
      },
      {
        nodeA: "perfectionism",
        nodeB: "japanese",
        hypothesis: "The perfectionism that drives repeated code refactoring may also explain why Japanese learning ended — once the perfect daily streak broke, the whole endeavor was abandoned.",
        strength: 0.6,
        evidence: "The streak ended. I haven't opened the app in six weeks. / I refactored the same component four times. It still doesn't feel right."
      }
    ],
    evolution: [
      {
        title: "Side Project → Startup",
        nodeIds: ["side_project", "startup_idea", "building_in_public", "money"],
        narrative: "What began as a personal tool in April 2024 gradually transformed into a product with paying users by early 2025. Each phase shifted the emotional weight — from playful experimentation to anxious possibility to genuine business decision. This is the clearest evolution arc in your entire journal.",
        evidence: [
          "April 2024: Started a side project. Mostly for fun.",
          "August 2024: People keep asking me about the tool. Maybe there's something here.",
          "February 2025: First paying user. This isn't a side project anymore.",
          "September 2025: We hit 100 users. I need to decide if I'm building a business or a hobby."
        ]
      },
      {
        title: "Voice → Silence → Page",
        nodeIds: ["podcast", "japanese", "writing"],
        narrative: "You explored several creative output forms — podcast, language learning, then writing. Each abandoned form left something behind. The podcast's failure gave you a clearer medium: writing. The Japanese streak's collapse showed you something about how you engage with new pursuits.",
        evidence: [
          "May 2024: I want to start a podcast.",
          "August 2024: Maybe writing is the right medium for me.",
          "After the podcast idea died, I started writing instead. It feels more honest."
        ]
      }
    ],
    dominantTheme: "A person in transition — from employee to founder, from consumer to creator, from someone who defers to someone who decides.",
    mirrorObservation: "Your thinking circles three gravitational centers: the startup (what you want to build), deep work (how you want to work), and identity (who you want to be). Nearly every other concept orbits one of these. The unresolved tension between all three is the engine of your journal."
  }
};
