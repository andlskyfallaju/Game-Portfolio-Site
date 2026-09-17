/**
 * UI Modal Management System
 * Controls the Project Dossier, PC Terminal, and interactive dialogs.
 */

import { PROJECTS, DEVELOPER_INFO } from "../data/projects.js";
import { MUSIC_TRACKS } from "../data/music.js";
import { sounds } from "../engine/audio.js";
import { enrichTrackMetadata } from "../engine/id3.js";

export class UIManager {
  constructor() {
    this.currentProjectIndex = 0;
    this.modalOverlay = document.getElementById("modal-overlay");
    this.projectModal = document.getElementById("project-modal");
    this.terminalModal = document.getElementById("terminal-modal");
    this.genericModal = document.getElementById("generic-modal");
    this.musicModal = document.getElementById("music-modal");
    this.hudTooltip = document.getElementById("hud-tooltip");
    this.hudObjectPrompt = document.getElementById("hud-object-prompt");

    this.tracks = [...MUSIC_TRACKS];

    this._setupEvents();
    this._setupMusicEvents();
    this._enrichTracks();
  }

  _setupEvents() {
    // Close modal when clicking backdrop or close buttons
    document.querySelectorAll(".modal-close-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.closeAllModals());
    });

    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) {
        this.closeAllModals();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.code === "KeyE") {
        if (!this.modalOverlay.classList.contains("hidden")) {
          const termInput = document.getElementById("term-cli-input");
          if (document.activeElement === termInput && e.code === "KeyE" && termInput.value.length > 0) {
            return;
          }
          this.closeAllModals();
          sounds.playSelect();
          e.preventDefault();
        }
      }
    });

    // Project dossier navigation arrows
    const prevBtn = document.getElementById("proj-prev-btn");
    const nextBtn = document.getElementById("proj-next-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentProjectIndex = (this.currentProjectIndex - 1 + PROJECTS.length) % PROJECTS.length;
        this.showProject(PROJECTS[this.currentProjectIndex]);
        sounds.playSelect();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentProjectIndex = (this.currentProjectIndex + 1) % PROJECTS.length;
        this.showProject(PROJECTS[this.currentProjectIndex]);
        sounds.playSelect();
      });
    }

    // Terminal command input
    const termInput = document.getElementById("term-cli-input");
    if (termInput) {
      termInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this._handleTerminalCommand(termInput.value.trim());
          termInput.value = "";
        }
      });
    }
  }

  updateHUD(hoveredItem) {
    if (!hoveredItem) {
      this.hudTooltip.style.opacity = "0";
      return;
    }

    this.hudTooltip.style.opacity = "1";
    this.hudObjectPrompt.innerHTML = `
      <span class="hud-item-name">${hoveredItem.name}</span>
      <span class="hud-item-action">${hoveredItem.prompt}</span>
    `;
  }

  showProject(project) {
    sounds.playBookOpen();
    const index = PROJECTS.findIndex(p => p.id === project.id);
    if (index !== -1) {
      this.currentProjectIndex = index;
    }

    // Render project details into modal
    document.getElementById("proj-shelf-badge").textContent = `${project.shelf} • Book ${this.currentProjectIndex + 1}/${PROJECTS.length}`;
    document.getElementById("proj-category").textContent = project.category;
    document.getElementById("proj-title").textContent = project.title;
    document.getElementById("proj-subtitle").textContent = project.subtitle;
    document.getElementById("proj-year").textContent = project.year;
    document.getElementById("proj-desc").textContent = project.description;

    // Book spine mini badge
    const spineIcon = document.getElementById("proj-spine-icon");
    if (spineIcon) {
      spineIcon.style.backgroundColor = project.spineColor;
    }

    // Tags
    const tagsContainer = document.getElementById("proj-tags");
    tagsContainer.innerHTML = "";
    for (const tag of project.tags) {
      const span = document.createElement("span");
      span.className = "tag-badge";
      span.textContent = tag;
      tagsContainer.appendChild(span);
    }

    // Highlights
    const list = document.getElementById("proj-highlights");
    list.innerHTML = "";
    for (const h of project.highlights) {
      const li = document.createElement("li");
      li.textContent = h;
      list.appendChild(li);
    }

    // Links
    const githubLink = document.getElementById("proj-github-link");
    const demoLink = document.getElementById("proj-demo-link");
    githubLink.href = project.github;
    if (project.demo) {
      demoLink.href = project.demo;
      demoLink.style.display = "inline-flex";
    } else {
      demoLink.style.display = "none";
    }

    // Render horizontal interactive book rack inside the modal
    this._renderBookshelfRack();

    this.modalOverlay.classList.remove("hidden");
    this.projectModal.classList.remove("hidden");
    this.terminalModal.classList.add("hidden");
    this.genericModal.classList.add("hidden");
  }

  _renderBookshelfRack() {
    const rack = document.getElementById("modal-shelf-rack");
    if (!rack) return;
    rack.innerHTML = "";

    PROJECTS.forEach((p, idx) => {
      const spine = document.createElement("div");
      spine.className = `shelf-book-spine ${idx === this.currentProjectIndex ? "active" : ""}`;
      spine.style.backgroundColor = p.spineColor;
      spine.title = `${idx + 1}. ${p.title}`;
      spine.addEventListener("click", () => {
        this.showProject(p);
      });
      rack.appendChild(spine);
    });
  }

  openTerminal() {
    sounds.playBoot();
    const termLogs = document.getElementById("term-logs");
    if (termLogs) {
      termLogs.innerHTML = `
        <p class="term-dim">=== DEVELOPER BATTLESTATION OS v2.4 ===</p>
        <p class="term-cyan">User: ${DEVELOPER_INFO.name} (${DEVELOPER_INFO.handle})</p>
        <p class="term-green">Status: ${DEVELOPER_INFO.status}</p>
        <p class="term-yellow">Bio: "${DEVELOPER_INFO.bio}"</p>
        <div class="term-section">
          <p class="term-header">⚙️ CORE SKILLS & TOOLS:</p>
          ${DEVELOPER_INFO.skills.map(s => `
            <p>• <span class="term-accent">${s.category}:</span> ${s.list.join(", ")}</p>
          `).join("")}
        </div>
        <p class="term-dim">Type <span class="term-highlight">'help'</span> to see commands or click the links below:</p>
        <div class="term-quick-links">
          <a href="${DEVELOPER_INFO.githubUrl}" target="_blank" class="term-btn">🐙 GitHub Profile</a>
          <a href="mailto:${DEVELOPER_INFO.email}" class="term-btn">✉️ Contact Email</a>
        </div>
      `;
    }

    this.modalOverlay.classList.remove("hidden");
    this.terminalModal.classList.remove("hidden");
    this.projectModal.classList.add("hidden");
    this.genericModal.classList.add("hidden");
  }

  _handleTerminalCommand(cmd) {
    const termLogs = document.getElementById("term-logs");
    if (!termLogs) return;

    const cmdLine = document.createElement("p");
    cmdLine.innerHTML = `<span class="term-prompt">&gt;</span> ${cmd}`;
    termLogs.appendChild(cmdLine);

    const lower = cmd.toLowerCase();
    const resp = document.createElement("div");

    if (lower === "help") {
      resp.innerHTML = `
        <p>Available commands:</p>
        <p>  <span class="term-yellow">projects</span>  - List all bookshelf projects</p>
        <p>  <span class="term-yellow">skills</span>    - View technical skill set</p>
        <p>  <span class="term-yellow">github</span>    - Open GitHub profile</p>
        <p>  <span class="term-yellow">contact</span>   - Contact email info</p>
        <p>  <span class="term-yellow">clear</span>     - Clear terminal buffer</p>
      `;
    } else if (lower === "projects") {
      resp.innerHTML = PROJECTS.map((p, i) => `
        <p>[${i + 1}] <span class="term-accent">${p.title}</span> - ${p.category} (${p.tags.join(", ")})</p>
      `).join("");
    } else if (lower === "skills") {
      resp.innerHTML = DEVELOPER_INFO.skills.map(s => `
        <p><span class="term-accent">${s.category}:</span> ${s.list.join(", ")}</p>
      `).join("");
    } else if (lower === "github") {
      window.open(DEVELOPER_INFO.githubUrl, "_blank");
      resp.innerHTML = `<p class="term-green">Opened ${DEVELOPER_INFO.githubUrl} in new tab!</p>`;
    } else if (lower === "contact") {
      resp.innerHTML = `<p>Email: <a href="mailto:${DEVELOPER_INFO.email}" class="term-link">${DEVELOPER_INFO.email}</a></p>`;
    } else if (lower === "clear") {
      termLogs.innerHTML = "";
      return;
    } else if (lower !== "") {
      resp.innerHTML = `<p class="term-red">Command not recognized: '${cmd}'. Type 'help' for options.</p>`;
    }

    termLogs.appendChild(resp);
    const scrollContainer = document.getElementById("term-body");
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  showGenericDialog(title, icon, message, actionHtml = "") {
    document.getElementById("generic-modal-title").textContent = title;
    document.getElementById("generic-modal-icon").textContent = icon;
    document.getElementById("generic-modal-message").innerHTML = message;
    document.getElementById("generic-modal-actions").innerHTML = actionHtml;

    this.modalOverlay.classList.remove("hidden");
    this.genericModal.classList.remove("hidden");
    this.projectModal.classList.add("hidden");
    this.terminalModal.classList.add("hidden");
  }

  _setupMusicEvents() {
    // Sync UI when track changes
    sounds.onTrackChange = () => {
      this._updateMusicUI();
    };

    sounds.onPlaybackError = (track, err) => {
      alert(`Track "${track.title}" could not be loaded.\nMake sure the file exists at: ${track.src}\nor select a local MP3 file using the button below.`);
    };

    // Play / Pause button in music modal
    const playPauseBtn = document.getElementById("music-play-pause-btn");
    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        sounds.toggleMusic();
        sounds.playSelect();
        this._updateMusicUI();
      });
    }

    /* Local file input disabled for security:
    const fileInput = document.getElementById("local-mp3-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const blobUrl = URL.createObjectURL(file);
        const customTrack = {
          id: "local_" + Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Loaded Local File",
          src: blobUrl,
          type: "mp3",
          description: `Custom local file: ${file.name}`,
          badge: "Local MP3"
        };

        this.tracks.unshift(customTrack);
        sounds.selectTrack(customTrack);
        sounds.playSelect();
        this._renderTrackList();
        this._updateMusicUI();
      });
    }
    */
  }

  async _enrichTracks() {
    for (const track of this.tracks) {
      if (track.type === "mp3") {
        await enrichTrackMetadata(track);
      }
    }

    // Auto-discover any additional track3.mp3 through track8.mp3 in assets/music/
    for (let i = 3; i <= 8; i++) {
      const src = `./assets/music/track${i}.mp3`;
      if (!this.tracks.some(t => t.src === src)) {
        try {
          const res = await fetch(src);
          if (res.ok) {
            const newTrack = {
              id: `custom_track_${i}`,
              title: `Track ${i}`,
              author: "Unknown Artist",
              src,
              type: "mp3",
              badge: "MP3 Track"
            };
            await enrichTrackMetadata(newTrack);
            this.tracks.push(newTrack);
          }
        } catch (e) {}
      }
    }

    this._renderTrackList();
    this._updateMusicUI();
  }

  showMusicPlayer() {
    sounds.playSelect();
    this.modalOverlay.classList.remove("hidden");
    this.musicModal.classList.remove("hidden");
    this.projectModal.classList.add("hidden");
    this.terminalModal.classList.add("hidden");
    this.genericModal.classList.add("hidden");

    this._enrichTracks();
    this._renderTrackList();
    this._updateMusicUI();
  }

  _renderTrackList() {
    const listContainer = document.getElementById("music-tracks-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const currentId = sounds.currentTrack ? sounds.currentTrack.id : "default_chiptune";

    this.tracks.forEach((track) => {
      const isCurrent = track.id === currentId;
      const item = document.createElement("div");
      item.className = `track-item ${isCurrent ? "active" : ""}`;
      item.innerHTML = `
        <div class="track-left">
          <span class="track-icon">${isCurrent ? "▶️" : "🎵"}</span>
          <div class="track-details">
            <span class="track-name">${track.title}</span>
            <span class="track-sub">Author: ${track.author || "Unknown"}</span>
          </div>
        </div>
        <div class="track-right">
          <span class="track-badge">${track.badge || "Audio"}</span>
          <button class="track-btn">${isCurrent ? "PLAYING" : "PLAY"}</button>
        </div>
      `;

      item.addEventListener("click", () => {
        sounds.selectTrack(track);
        sounds.playSelect();
        this._renderTrackList();
        this._updateMusicUI();
      });

      listContainer.appendChild(item);
    });
  }

  _updateMusicUI() {
    const isPlaying = sounds.isMusicActive();
    const current = sounds.currentTrack;

    // Update cassette title
    const cassetteTitle = document.getElementById("cassette-track-title");
    if (cassetteTitle && current) {
      cassetteTitle.textContent = current.author ? `${current.title} • ${current.author}` : current.title;
    }

    // Update cassette reels spinning animation
    const spoolLeft = document.getElementById("cassette-spool-left");
    const spoolRight = document.getElementById("cassette-spool-right");
    if (spoolLeft && spoolRight) {
      spoolLeft.classList.toggle("spinning", isPlaying);
      spoolRight.classList.toggle("spinning", isPlaying);
    }

    // Update status dot & text
    const dot = document.getElementById("music-indicator");
    const statusText = document.getElementById("music-playing-name");
    const playPauseBtn = document.getElementById("music-play-pause-btn");

    if (dot) {
      dot.classList.toggle("paused", !isPlaying);
    }

    if (statusText) {
      if (isPlaying && current) {
        statusText.textContent = `NOW PLAYING: ${current.title}${current.author ? ` (${current.author})` : ""}`;
      } else {
        statusText.textContent = `PAUSED: ${current ? current.title : "No Track"}`;
      }
    }

    if (playPauseBtn) {
      playPauseBtn.textContent = isPlaying ? "⏸ Pause" : "▶️ Play";
    }

    // Sync header button if it exists
    const headerMusicBtn = document.getElementById("toggle-music-btn");
    if (headerMusicBtn) {
      headerMusicBtn.textContent = isPlaying ? "🎵 Music On" : "🎵 Music Off";
      headerMusicBtn.classList.toggle("active", isPlaying);
    }
  }

  onClose(cb) {
    if (!this.closeListeners) this.closeListeners = [];
    this.closeListeners.push(cb);
  }

  closeAllModals() {
    this.modalOverlay.classList.add("hidden");
    this.projectModal.classList.add("hidden");
    this.terminalModal.classList.add("hidden");
    this.genericModal.classList.add("hidden");
    if (this.musicModal) {
      this.musicModal.classList.add("hidden");
    }
    if (this.closeListeners) {
      for (const cb of this.closeListeners) {
        cb();
      }
    }
  }
}
