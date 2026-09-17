/**
 * GitHub Projects Data Configuration
 * Each project corresponds to a book spine on the bookshelf in the developer's room.
 * Mapped to Andile Makuyana's (@andlskyfallaju) real GitHub repositories and systems work.
 */

export const PROJECTS = [
  {
    id: "cpugpurender",
    shelf: "Top Shelf",
    slot: 0,
    spineColor: "#5fa3ab", // Teal
    title: "cpugpurender",
    subtitle: "AVX-512 & AVX2 SIMD Software GPU Renderer",
    category: "Systems & Graphics",
    year: "2025",
    tags: ["C++", "AVX2/SIMD", "x86-64 ASM", "JIT", "Hi-Z Culling"],
    description: "A high-performance CPU software renderer built for raw speed: AVX-512 and AVX2 SIMD throughout, a tile-based deferred pipeline, Hi-Z hierarchical depth culling, and P/E-core-aware CPU affinity to optimize Intel hybrid architecture. Includes a hand-rolled x86-64 JIT compiler, a BVH with SAH binning, shadow mapping, normal mapping, and MSAA.",
    highlights: [
      "AVX-512 & AVX2 SIMD parallelism simulating GPU shader pipelines",
      "Tile-based deferred shading with Hi-Z hierarchical depth culling",
      "Hand-rolled x86-64 JIT compiler for runtime microcode execution",
      "P/E-core aware thread affinity optimized for Intel hybrid CPUs"
    ],
    github: "https://github.com/andlskyfallaju/cpugpurender",
    demo: "https://github.com/andlskyfallaju/cpugpurender",
    stats: { stars: 1, forks: 0, status: "Active" }
  },
  {
    id: "aria-ai",
    shelf: "Top Shelf",
    slot: 1,
    spineColor: "#c6c7b8", // Grey / Slate
    title: "Aria AI",
    subtitle: "From-Scratch Local Transformer LLM",
    category: "AI & Machine Learning",
    year: "2025",
    tags: ["Python", "PyTorch", "Hugging Face", "LoRA / QLoRA", "Whisper", "Ollama"],
    description: "A custom transformer LLM architected and trained from the ground up rather than fine-tuned on top of an existing checkpoint. Built in PyTorch with Hugging Face's training tooling — focusing on deliberate architectural design across multi-head attention, feed-forward blocks, and custom training loops with Whisper STT and Coqui TTS integration.",
    highlights: [
      "Architected attention and feed-forward blocks directly in PyTorch from scratch",
      "Full training loop implementation and loss convergence tracking",
      "Integrated Whisper STT, Coqui TTS, and Ollama bridge",
      "Optimized local inference with LoRA / QLoRA parameter adaptation"
    ],
    github: "https://github.com/andlskyfallaju/Aria-AI",
    demo: "https://github.com/andlskyfallaju/Aria-AI",
    stats: { stars: 1, forks: 0, status: "Active" }
  },
  {
    id: "local-pda-assistant",
    shelf: "Top Shelf",
    slot: 2,
    spineColor: "#aadf8a", // Green
    title: "Local PDA Assistant",
    subtitle: "PySide6 & C++ Lightweight Desktop Assistant",
    category: "AI & Desktop Tools",
    year: "2025",
    tags: ["Python", "C++", "PySide6", "yt-dlp", "VLC", "PowerShell"],
    description: "Aria's lightweight desktop companion: a Python/C++ hybrid with a sleek PySide6 overlay widget system — music player, activity/speech HUD, and selection widgets. Features YouTube playback (yt-dlp + VLC), local audio, app launching with a UWP fallback via PowerShell, system telemetry, and a global media-key listener.",
    highlights: [
      "Hardware-accelerated non-intrusive floating PySide6 overlay widgets",
      "Embedded VLC player with yt-dlp YouTube audio streaming pipeline",
      "UWP application launcher fallback via background PowerShell commands",
      "Low-latency global media keys listener and real-time hardware telemetry"
    ],
    github: "https://github.com/andlskyfallaju/Local-PDA-Assistant",
    demo: "https://github.com/andlskyfallaju/Local-PDA-Assistant",
    stats: { stars: 1, forks: 0, status: "Active" }
  },
  {
    id: "narrative-fps",
    shelf: "Top Shelf",
    slot: 3,
    spineColor: "#ffadbd", // Rose Pink
    title: "Narrative Unity FPS",
    subtitle: "First-Person 3D Action & Combat Loop",
    category: "Game Development",
    year: "2025",
    tags: ["Unity", "C#", "NavMesh", "3D Combat", "Game Feel"],
    description: "A fast-paced first-person combat game stood up from scratch in Unity: dynamic NavMesh AI enemy flanking, projectile shooting, per-enemy health bars, player HUD, win/lose states, hit-flash feedback, bullet trails, and checkpoint progression.",
    highlights: [
      "Aggressive NavMesh enemy pathfinding and tactical flanking behaviors",
      "Physics-based projectile shooting with dynamic bullet trajectory trails",
      "Crisp combat game feel: screen shake, hit-flash feedback, and sound FX",
      "Modular HUD system with real-time health, reticle, and checkpoints"
    ],
    github: "https://github.com/andlskyfallaju/Narrative-FPS",
    demo: "https://github.com/andlskyfallaju/Narrative-FPS",
    stats: { stars: 1, forks: 0, status: "In Progress" }
  },
  {
    id: "dungeon-escape",
    shelf: "Middle Shelf",
    slot: 4,
    spineColor: "#7597d5", // Blue
    title: "Dungeon Escape 2D",
    subtitle: "Java & JavaFX Dungeon Raid Adventure",
    category: "Game Development",
    year: "2026",
    tags: ["Java", "JavaFX / Swing", "A* Pathfinding", "Procedural Generation"],
    description: "16 source files of pure dungeon crawling: A* pathfinding algorithms, procedural map generation, intricate boss mechanics, and custom sprite animations — developed for ICT 2.1 Programming in Java at Arrupe Jesuit University.",
    highlights: [
      "Grid-based A* pathfinding algorithm for intelligent monster pursuit",
      "Procedural dungeon layout generator with room carving and corridor linkage",
      "Multi-phase boss battle encounters with pattern attacks and vulnerabilities",
      "Built entirely in pure Java without third-party game frameworks"
    ],
    github: "https://github.com/andlskyfallaju/DungeonEscape",
    demo: "https://github.com/andlskyfallaju/DungeonEscape",
    stats: { stars: 1, forks: 0, status: "Complete" }
  },
  {
    id: "mindaprice-zw",
    shelf: "Middle Shelf",
    slot: 5,
    spineColor: "#f8d386", // Golden Yellow
    title: "MindaPriceZW",
    subtitle: "Agricultural Marketplace & Farmer Advisory Mobile App",
    category: "Mobile & Full-Stack",
    year: "2025",
    tags: ["Flutter", "Dart", "Node.js", "Express", "REST API", "Mobile"],
    description: "A comprehensive mobile platform designed to empower Zimbabwean farmers with real-time agricultural market prices, weather-based farming advisories, and an integrated messenger connecting growers directly to buyers. Paired with a custom Node.js/Express backend API.",
    highlights: [
      "Real-time agricultural commodity pricing and marketplace produce listings",
      "Weather forecast engine generating timely localized farming advisories",
      "Integrated buyer-farmer in-app messenger for direct trade negotiations",
      "Multi-repo architecture with custom REST backend (mindaprice-backend)"
    ],
    github: "https://github.com/andlskyfallaju/mindaprice-zw-app",
    demo: "https://github.com/andlskyfallaju/mindaprice-zw-app",
    stats: { stars: 1, forks: 0, status: "Active" }
  },
  {
    id: "skyfall-music-player",
    shelf: "Middle Shelf",
    slot: 6,
    spineColor: "#84dbb4", // Mint Green
    title: "Skyfall Music Player",
    subtitle: "Cross-Platform YouTube & Local Audio Player",
    category: "Mobile & Desktop",
    year: "2025",
    tags: ["Flutter", "Dart", "Android Widgets", "Windows Desktop", "VLC"],
    description: "A cross-platform Flutter music player with complete library management: sorting/filtering, drag-and-drop reordering, artist & album cover art caching, cookie-based YouTube streaming, a home-screen Android widget (debugged via ADB logcat), and native Windows desktop builds.",
    highlights: [
      "Native Android home-screen widget with real-time playback control",
      "Fluid drag-to-reorder playlist queue and tag metadata parsing",
      "Cookie-authenticated YouTube audio stream extraction and caching",
      "Unified codebase running natively on Android mobile and Windows desktop"
    ],
    github: "https://github.com/andlskyfallaju/Mobile-Music-App",
    demo: "https://github.com/andlskyfallaju/Mobile-Music-App",
    stats: { stars: 1, forks: 0, status: "Active" }
  },
  {
    id: "asl-recogniser",
    shelf: "Middle Shelf",
    slot: 7,
    spineColor: "#cd5e8f", // Plum / Violet
    title: "ASL Gesture Recogniser",
    subtitle: "Computer Vision Sign Language Translator",
    category: "AI & Computer Vision",
    year: "2025",
    tags: ["Python", "OpenCV", "MediaPipe", "Computer Vision", "Machine Learning"],
    description: "A real-time American Sign Language (ASL) translator that captures webcam video, extracts 21-point hand skeletal landmarks, and converts gestures into translated letters and words displayed on screen.",
    highlights: [
      "Real-time 21-point hand landmark tracking via MediaPipe pipeline",
      "Spatial geometry normalization for robust scale and rotation invariance",
      "Low-latency OpenCV video stream processing at high frame rates",
      "Interactive visual feedback overlay for learning and gesture verification"
    ],
    github: "https://github.com/andlskyfallaju/ASL-Recogniser-using-Python",
    demo: "https://github.com/andlskyfallaju/ASL-Recogniser-using-Python",
    stats: { stars: 1, forks: 0, status: "Active" }
  }
];

export const DEVELOPER_INFO = {
  name: "Andile Makuyana (Skyfall)",
  handle: "@andlskyfallaju",
  githubUrl: "https://github.com/andlskyfallaju",
  email: "andile@skyfall.dev",
  status: "🟢 Active • Building systems, graphics & AI",
  bio: "BSc Hons ICT (Software Engineering) student at Arrupe Jesuit University. Passionate about software rendering, AVX SIMD, from-scratch transformer LLMs, game development, and high-performance cross-platform apps.",
  skills: [
    { category: "Systems & Graphics", list: ["C++ (AVX-512 / AVX2)", "x86-64 ASM", "JIT Compilers", "Software Renderers", "WinDbg", "MemTest86"] },
    { category: "AI & Machine Learning", list: ["Python", "PyTorch", "Transformers", "LoRA / QLoRA", "Whisper STT", "Coqui TTS", "OpenCV / MediaPipe"] },
    { category: "Game Development", list: ["Unity (C#)", "Java / JavaFX", "A* Pathfinding", "Procedural Generation", "NavMesh AI"] },
    { category: "Mobile & Full-Stack", list: ["Flutter / Dart", "JavaScript (ES6+)", "Node.js / Express", "PHP / SQL", "PySide6", "Git"] }
  ]
};

/**
 * Credits & Attribution
 * All sprite assets and resources used in this portfolio project.
 * Music credits are added manually by the developer.
 */
export const CREDITS = {
  sprites: [
    {
      category: "🏠 Room & Furniture Tileset",
      name: "Pocket RPG Indoors Asset Pack",
      author: "Vryell (itch.io)",
      license: "CC0 1.0 Universal — Public Domain",
      url: "https://vryell.itch.io/pocket-rpg-indoors",
      usage: "Room base tileset, furniture, sofa, bed, bookshelf, desk, stereo boombox sprite"
    },
    {
      category: "👾 Character Sprites",
      name: "16×16 RPG Character Sprites",
      author: "Route1Rodent (itch.io)",
      license: "CC0 1.0 Universal — Public Domain",
      url: "https://route1rodent.itch.io/16x16-rpg-character-sprite-sheet",
      usage: "Player character walk cycles (4-directional animation)"
    },
    {
      category: "🎱 Billiards / Pool Table",
      name: "8-Ball Asset Pack",
      author: "Hamuko27 (itch.io)",
      license: "Free to use (itch.io)",
      url: "https://hamuko27.itch.io/8-ball-asset-pack-free",
      usage: "Billiards table, cue stick, ball textures, and felt felt layout"
    }
  ],
  engine: {
    name: "Custom Vanilla JS 2D Game Engine",
    author: "Andile Makuyana (@andlskyfallaju)",
    url: "https://github.com/andlskyfallaju/Game-Portfolio-Site",
    description: "100% hand-rolled: canvas rendering, WASD movement, collision, Web Audio API chiptune synth, particle systems, interactive furniture, billiards physics simulation, ID3 tag parser, and modal UI — zero external libraries."
  },
  note: "Music credits — to be added manually by the developer."
};

