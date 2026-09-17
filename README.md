# Interactive 2D Pixel Art Portfolio Game - Walkthrough

An interactive 2D top-down pixel art portfolio website demo. The player controls a customizable character in a cozy developer room using WASD or arrow keys, with full mouse interaction for furniture and books.

## What Was Accomplished

### 1. 2D Game Engine & Pixel Art Rendering
- **Crisp Integer Pixel Scaling**: The room runs at a native resolution of 192×160 pixels with `image-rendering: pixelated`, surrounded by a synthwave arcade cabinet with optional CRT scanline filter.
- **WASD Character Movement**:
  - 4-directional walk cycles (Down, Left, Right, Up) with frame-by-frame animations from `01-generic.png`.
  - Walking dust puff particle effects and footstep sounds.
  - Character skin selector in the header toolbar to switch between 10 hero styles (*Red Mage, Green Archer, Blue Bard, Orange Knight, etc.*).
- **Smooth Collision Handling**:
  - Tight collision box at the character's feet (bottom 10×6 px) enabling natural depth sorting against all room boundaries, walls, bed, desk, and bookshelf.

### 2. Interactive Furniture & Bookshelf
- **Selectable Books on the Bookshelf**:
  - Hovering over individual books on the shelf highlights the book spine with a glowing indicator and in-game tooltip.
  - Clicking any book opens the **Retro Project Dossier Modal** populated with **Andile Makuyana's (@andlskyfallaju)** real projects:
    1. **cpugpurender**: AVX-512 & AVX2 Software GPU Renderer (C++, x86-64 ASM, JIT, Hi-Z Culling)
    2. **Aria AI**: From-Scratch Local Transformer LLM (PyTorch, Hugging Face, LoRA, Whisper, Coqui TTS)
    3. **Local PDA Assistant**: PySide6 & C++ Lightweight Desktop Assistant (yt-dlp, VLC, PowerShell)
    4. **Narrative Unity FPS**: Fast-Paced 3D First-Person Combat Loop (Unity, C#, NavMesh AI)
    5. **Dungeon Escape 2D**: Java & JavaFX Dungeon Raid Adventure (A* Pathfinding, Procedural Generation)
    6. **MindaPriceZW**: Agricultural Marketplace & Farmer Advisory Mobile Platform (Flutter, Dart, Node.js/Express)
    7. **Skyfall Music Player**: Cross-Platform YouTube & Local Audio Player (Flutter, Android Widgets, Windows Desktop)
    8. **ASL Gesture Recogniser**: Computer Vision Sign Language Translator (Python, OpenCV, MediaPipe)
  - Interactive **Bookshelf Rack** inside the modal allowing quick switching between all 8 projects with a single click.
  - Direct buttons for **GitHub Repository** and **Live Demo**.
- **Battlestation PC**:
  - Monitor screen glass turns ON/OFF with an animated smiley face.
  - Opens the **Developer Terminal Modal** with bio, skills matrix, interactive CLI commands (`help`, `skills`, `projects`, `github`, `contact`), and social links.
  - **Fixed Overlapping Screen**: Sourced screen face coordinates directly inside the monitor glass, eliminating any duplicate computer rendering.
- **Blue Velvet Sofa**:
  - Clicking the sofa seats the character naturally on top of the cushion facing forward.
  - **Fixed Sofa Clipping**: Character sits above the seat cushion with no overlay occlusion.
  - Pressing **[E]** or any movement key stands back up.
- **Nightstand Lamp**:
  - Acts as a tactile in-game **Day / Night mode toggle**.
  - Night mode casts a warm ambient radial glow around the lamp and PC while the window reveals twinkling stars.
  - Synchronized with the header Day/Night toolbar button.
- **TV / Console**:
  - Powers on the retro console unit with an animated cat face screen (fixed previous coordinate offset).
- **Monstera Plant & Window**:
  - Click to water the plant (water droplet sound & sparkle animation) or cycle outside weather (*Sun, Rain, Stars*).

### 3. Length-Wise 8-Ball Billiards Table & Chair Textures
- **Vertical (Length-Wise) Orientation**:
  - Rotated the 8-ball billiards table to run vertically (`x=129, y=62, w=26, h=44`), perfectly proportioned for top-down room navigation with spacious corridors on both the left and right.
- **Restored Dining Chair Textures**:
  - Put the original cushion chair textures back from `house1.png`:
    - 2 chairs placed at the top (`y=46..62`) beneath the bookshelf.
    - 2 chairs placed at the bottom (`y=106..122`).
- **Walkable Cushions**:
  - The top and bottom cushion chairs around the table are passable decor entities that the player can freely walk across without blocking navigation. Only the pool table itself (`x=129, y=62, w=26, h=44`) remains solid.
- **Vertical Physics & Billiards Simulation**:
  - Cue ball racked near the bottom cushion (`x: 142, y: 95`).
  - 8-ball and colored balls racked vertically near the top (`x: 142, y: 74`).
  - Cue stick aims and delivers an impulse strike upwards towards the rack.
  - Sinks colored balls in 1 to 5 random shots, followed by the black 8-ball shot with a 25% cue scratch probability, ivory sound effects, and auto-reset.

### 4. 📻 Retro Boombox Stereo & Music Player Modal
- **Sprite Placement**:
  - Extracted the retro boombox stereo sprite from Pocket RPG assets and placed it in the **bottom-right corner against the wall** (`x=158, y=126`), exactly in the user's circled area.
  - Floating retro musical note particles (`♪`, `♫`) drift up from the stereo whenever music is playing.
- **Dynamic Song Name & Author Metadata**:
  - **Identified & Configured Active Tracks**:
    - **Track 1**: `Git City - Your GitHub as a 3D City` | **Author**: `Samuel Rizzon` (matched and tagged directly from the user's audio file).
    - **Track 2**: `Phototropic` | **Author**: `Chime` (parsed from embedded ID3v2/ID3v1 tags).
  - **Embedded ID3 Tag Reader (`src/engine/id3.js`)**:
    - Built a lightweight native Web API (`TextDecoder` + `ReadableStream`) binary ID3 parser that reads ID3v2.2, ID3v2.3, ID3v2.4 (`TIT2`/`TT2` for Title, `TPE1`/`TP1` for Artist) without downloading full audio files.
    - Added automatic discovery for additional tracks (`track3.mp3` through `track8.mp3`) when placed into `assets/music/`.
  - **Interactive Cassette Deck & Status**:
    - Mixtape cassette band displays `<Title> • <Author>`.
    - "Now Playing" bar displays `NOW PLAYING: <Title> (<Author>)`.
    - Track list items display the song title and `Author: <author_name>`.
  - **Security Clean-Up**: Commented out the local file upload box for secure static deployment.
  - **Full Controls**: Play, pause, now playing indicator, and press **[E]** to exit.

### 4. Couch Sitting Depth & Perspective
- Updated sofa sitting mechanics: character sits tucked **behind the couch** (`x=92, y=58`) facing the TV (`direction = 3`).
- In `drawForeground`, the couch front renders over the character's body, leaving **only their head peeking over the top backrest** to create a natural seated perspective.
- Pressing **[E]**, clicking the sofa again, or pressing any movement key stands the character up **facing the TV** at `(x=98, y=46, direction=3)`, matching the exact position above the couch cushion.

### 5. Bed Sleep & Right-Side Wake Up
- **Reverted Dialog Auto-Wake**: Dismissing or closing the dialog modal does **not** wake the player; they remain tucked peacefully in bed with floating `Zzz` particles.
- The player only wakes when pressing **[WASD]** or **[E]**.
- **Right-Side Wake Position**: Character wakes up on the open right side of the bed at `(x=64, y=48)` facing right into the room, avoiding getting stuck against the top or side walls.

### 6. Exit Keybind `[E]` & Background Audio
- Added **[E]** keybind across all interactable states and modals (modals, standing from sofa, waking from bed).
- Procedural Web Audio 8-bit chiptune background music with toggle.
- Chiptune sound effects: ball hit clacks, pocket drops, victory jingle, scratch buzz, footsteps, book opening, power toggle, water drops, and lullaby notes.

## Verification Summary

| Feature / Fix | Verification Result |
| :--- | :--- |
| **8-Ball Billiards Table** | Replaces table; clicks simulate 1-5 shots to sink colored balls, 8-ball shot with 25% scratch chance, sound effects, & auto-reset |
| **Couch Sitting** | Character sits behind the couch facing TV with couch covering body and head peeking over backrest; [E]/WASD stands |
| **Bed Sleep & Wake** | Closing modal keeps player asleep; waking with WASD/[E] places character on right side of bed `(64, 48)` |
| **Bookshelf Selection** | Clicking books opens Project Dossier with tags, highlights, and GitHub links |
| **Exit Key [E]** | Pressing `E` immediately exits modals, standing up, and waking from bed |
| **Nightstand Lamp** | Toggles Day/Night mode, casting cozy warm light and updating window stars |
| **TV Console** | Displays animated screen cleanly with zero duplicate lamps |
| **PC Screen** | Single pixel-aligned monitor with glowing face and interactive dev terminal |
| **Background Music & SFX** | Procedural 8-bit chiptune with dedicated mute/unmute control |
| **Static Hosting Ready** | 100% pure static web code (HTML5 canvas, CSS, ES6 JS), ready for GitHub Pages or Vercel |
