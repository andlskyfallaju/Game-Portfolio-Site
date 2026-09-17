/**
 * Game Portfolio Site - Main Lifecycle Controller
 */

import { InputManager } from "./engine/input.js";
import { CollisionSystem } from "./engine/collision.js";
import { sounds } from "./engine/audio.js";
import { Player } from "./entities/player.js";
import { Room } from "./entities/room.js";
import { InteractableManager } from "./entities/interactables.js";
import { BilliardsSimulation } from "./entities/billiards.js";
import { UIManager } from "./ui/modal.js";
import { PROJECTS, DEVELOPER_INFO } from "./data/projects.js";

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;

    this.lastTime = performance.now();
    this.assets = {};
    this.isLoaded = false;

    this.input = new InputManager(this.canvas);
    this.collision = new CollisionSystem();
    this.player = new Player(100, 118);
    this.interactables = new InteractableManager();
    this.billiards = new BilliardsSimulation();
    this.ui = new UIManager();

    this._setupControls();
  }

  async init() {
    try {
      await this._loadAssets();
      this.room = new Room(this.assets.room, this.assets.furniture);
      this.isLoaded = true;

      // Handle interactions on click
      this.input.onClick((mx, my) => this._handleClick(mx, my));

      // Hide loading screen
      const loader = document.getElementById("loading-screen");
      if (loader) {
        loader.classList.add("hidden");
      }

      // Start game loop
      requestAnimationFrame((t) => this.loop(t));
    } catch (err) {
      console.error("Failed to load game assets:", err);
    }
  }

  _loadAssets() {
    const imagesToLoad = {
      room: "./assets/room.png",
      characters: "./assets/characters.png",
      furniture: "./assets/furniture.png"
    };

    const promises = Object.entries(imagesToLoad).map(([key, src]) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.assets[key] = img;
          resolve();
        };
        img.onerror = (e) => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });
    });

    return Promise.all(promises);
  }

  _setupControls() {
    // Character Skin Selector
    const skinSelect = document.getElementById("skin-selector");
    if (skinSelect) {
      skinSelect.addEventListener("change", (e) => {
        this.player.setSkin(parseInt(e.target.value, 10));
        sounds.playSelect();
      });
    }

    // Sound Mute Toggle
    const muteBtn = document.getElementById("toggle-sound-btn");
    if (muteBtn) {
      const updateMuteIcon = () => {
        muteBtn.textContent = sounds.muted ? "🔇 Sound Off" : "🔊 Sound";
        muteBtn.classList.toggle("active", !sounds.muted);
      };
      updateMuteIcon();
      muteBtn.addEventListener("click", () => {
        sounds.toggleMute();
        updateMuteIcon();
        if (musicBtn) updateMusicIcon();
      });
    }

    // Music Toggle
    const musicBtn = document.getElementById("toggle-music-btn");
    const updateMusicIcon = () => {
      if (musicBtn) {
        const isPlaying = sounds.musicEnabled && !sounds.muted;
        musicBtn.textContent = isPlaying ? "🎵 Music On" : "🎵 Music Off";
        musicBtn.classList.toggle("active", isPlaying);
      }
    };
    if (musicBtn) {
      updateMusicIcon();
      musicBtn.addEventListener("click", () => {
        sounds.toggleMusic();
        updateMusicIcon();
      });
    }

    // Start BGM on first user interaction (browser policy)
    const startAudioOnGesture = () => {
      sounds.init();
      if (sounds.musicEnabled && !sounds.muted) {
        sounds.startBGM();
      }
      updateMusicIcon();
      window.removeEventListener("keydown", startAudioOnGesture);
      window.removeEventListener("mousedown", startAudioOnGesture);
    };
    window.addEventListener("keydown", startAudioOnGesture);
    window.addEventListener("mousedown", startAudioOnGesture);

    // Day / Night Mode Toggle
    const nightBtn = document.getElementById("toggle-night-btn");
    if (nightBtn) {
      nightBtn.addEventListener("click", () => {
        if (this.room) {
          this.room.isNight = !this.room.isNight;
          this.room.weather = this.room.isNight ? "stars" : "sun";
          nightBtn.textContent = this.room.isNight ? "🌙 Night" : "☀️ Day";
          nightBtn.classList.toggle("active", this.room.isNight);
          sounds.playSelect();
        }
      });
    }

    // CRT Scanlines Effect Toggle
    const crtBtn = document.getElementById("toggle-crt-btn");
    const scanlines = document.getElementById("scanline-overlay");
    if (crtBtn && scanlines) {
      crtBtn.addEventListener("click", () => {
        scanlines.classList.toggle("hidden");
        crtBtn.classList.toggle("active");
        sounds.playSelect();
      });
    }

    // Fullscreen Toggle
    const fsBtn = document.getElementById("toggle-fullscreen-btn");
    const container = document.getElementById("game-cabinet");
    if (fsBtn && container) {
      fsBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen();
        }
      });
    }

    // Help / Controls modal toggle
    const helpBtn = document.getElementById("toggle-help-btn");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        this.ui.showGenericDialog(
          "How to Explore My Portfolio",
          "🎮",
          `
            <div class="guide-list">
              <p><strong>[WASD] or Arrow Keys:</strong> Walk around the developer room</p>
              <p><strong>[Mouse Cursor]:</strong> Hover over any furniture or book</p>
              <p><strong>[Left Click on Bookshelf Books]:</strong> Open detailed GitHub project dossiers with summaries, tags, & live repos</p>
              <p><strong>[Left Click on PC Desk]:</strong> Boot the dev terminal, skills matrix, and interactive CLI</p>
              <p><strong>[Left Click on Bed]:</strong> Take a nap & toggle Day/Night lighting mode</p>
              <p><strong>[Left Click on Lamp/TV/Plant]:</strong> Toggle light, watch console demo, water the monstera</p>
            </div>
          `
        );
      });
    }
  }

  _handleClick(mx, my) {
    const item = this.interactables.hoveredItem;
    if (!item) return;

    this.interactables.spawnSparks(mx, my);

    if (item.type === "book") {
      // Direct book click: open project dossier!
      this.ui.showProject(item.project);
    } else if (item.id === "bookshelf_general") {
      // Clicked bookshelf background: open library with first project
      this.ui.showProject(PROJECTS[0]);
    } else if (item.id === "pc_desk") {
      // Power on PC screen and open developer terminal
      this.room.pcOn = true;
      this.ui.openTerminal();
    } else if (item.id === "bed") {
      // Rest in bed
      this.player.isSleeping = true;
      this.player.isSitting = false;
      this.player.x = 24;
      this.player.y = 36;
      sounds.playSleep();
      this.ui.showGenericDialog(
        "Taking a Cozy Nap",
        "🛏️",
        `<p>You tucked into bed.</p><p class="term-yellow">Press <strong>[E]</strong> or any <strong>WASD</strong> key to wake up!</p>`
      );
    } else if (item.id === "lamp") {
      // Nightstand lamp acts as Day / Night mode toggle!
      this.room.isNight = !this.room.isNight;
      this.room.lampOn = true;
      this.room.weather = this.room.isNight ? "stars" : "sun";
      sounds.playPower();

      const nightBtn = document.getElementById("toggle-night-btn");
      if (nightBtn) {
        nightBtn.textContent = this.room.isNight ? "🌙 Night" : "☀️ Day";
        nightBtn.classList.toggle("active", this.room.isNight);
      }

      this.interactables.spawnSparks(item.x + item.w / 2, item.y + item.h / 2, this.room.isNight ? "#ffea78" : "#80d0ff");
    } else if (item.id === "tv") {
      this.room.tvOn = !this.room.tvOn;
      sounds.playPower();
      this.ui.showGenericDialog(
        "Retro Gaming Station",
        "📺",
        `<p>Console powered <strong>${this.room.tvOn ? "ON" : "OFF"}</strong>!</p><p>Equipped with custom pixel art game prototypes and 2D mechanics tests.</p>`
      );
    } else if (item.id === "plant") {
      sounds.playWater();
      this.ui.showGenericDialog(
        "Pixel Monstera Plant",
        "🌿",
        `<p>You watered the monstera plant with fresh mountain water!</p><p class="term-green">Healthy status: 100%. +10 Coding Inspiration gained!</p>`
      );
    } else if (item.id === "painting") {
      sounds.playSelect();
      this.ui.showGenericDialog(
        "Pixel Horizon Painting",
        "🖼️",
        `<p>"Sunset over 16-bit Mountains" — inspired by SNES and Game Boy Color classics.</p>`
      );
    } else if (item.id === "window") {
      sounds.playSelect();
      const nextWeather = this.room.weather === "sun" ? "rain" : this.room.weather === "rain" ? "stars" : "sun";
      this.room.weather = nextWeather;
      this.ui.showGenericDialog(
        "Room Window",
        "🪟",
        `<p>Looking out the window: Weather changed to <strong>${nextWeather.toUpperCase()}</strong>!</p>`
      );
    } else if (item.id === "billiards_table" || item.id === "table") {
      this.billiards.interact();
    } else if (item.id === "sofa") {
      sounds.playSelect();
      if (this.player.isSitting) {
        // Stand up facing the TV
        this.player.isSitting = false;
        this.player.x = 98;
        this.player.y = 46; // Spawns above sofa facing the TV
        this.player.direction = 3; // Facing UP towards TV
      } else {
        // Sit down
        this.player.isSitting = true;
        this.player.isSleeping = false;
        this.player.x = 92;
        this.player.y = 58; // Sits tucked behind the couch backrest with head peeking out
        this.player.direction = 3; // Facing UP towards TV
      }
    } else if (item.id === "stereo") {
      this.ui.showMusicPlayer();
    } else if (item.id === "door") {
      sounds.playSelect();
      this.ui.showGenericDialog(
        "Developer Contact & Links",
        "🚪",
        `
          <p>Thanks for visiting my portfolio room!</p>
          <div class="contact-links-grid">
            <a href="${DEVELOPER_INFO.githubUrl}" target="_blank" class="modal-btn btn-primary">🐙 GitHub Profile</a>
            <a href="mailto:${DEVELOPER_INFO.email}" class="modal-btn btn-secondary">✉️ Send Email</a>
          </div>
        `
      );
    }
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Update
    this.player.update(dt, this.input, this.collision);
    this.room.update(dt, this.player.isSleeping, sounds.isMusicActive());
    this.billiards.update(dt);

    // Update billiards table prompt dynamically
    const tableItem = this.interactables.furniture.find(f => f.id === "billiards_table");
    if (tableItem) {
      tableItem.prompt = this.billiards.statusText;
    }

    this.interactables.update(this.input.mouse);
    this.ui.updateHUD(this.interactables.hoveredItem);
    this.input.update();

    // Render
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Room background + dynamic screens
    this.room.drawBackground(this.ctx);

    // 2. Billiards simulation on the table felt
    this.billiards.draw(this.ctx);

    // 3. Interactable hover highlights and spark particles
    this.interactables.draw(this.ctx);

    // 4. Player entity
    this.player.draw(this.ctx, this.assets.characters);

    // 5. Foreground Y-sorting (sofa/table front) + Zzz particles
    this.room.drawForeground(this.ctx, this.player);

    // 6. Lighting & Day/Night gradient mask
    this.room.drawLighting(this.ctx);

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.init();
});
