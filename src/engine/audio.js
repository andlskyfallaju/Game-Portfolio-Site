/**
 * Retro 8-bit Web Audio Synthesizer
 * Generates dynamic chiptune sound effects procedurally without external audio files.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("game_sound_muted") === "true";
    this.musicEnabled = localStorage.getItem("game_music_enabled") !== "false";
    this.lastStepTime = 0;

    // Background Music State
    this.bgmPlaying = false;
    this.bgmStep = 0;
    this.bgmTimer = null;
    this.bgmNextNoteTime = 0;
    this.bgmFilter = null;

    // Custom MP3 Audio Player
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.volume = 0.55;
    // Default to track1.mp3 as the startup soundtrack
    this.currentTrack = {
      id: "custom_track_1",
      title: "Study Lofi Music",
      author: "SolarFLEX",
      src: "./assets/music/track1.mp3",
      type: "mp3",
      badge: "MP3 Track"
    };
    // Pre-load track1 into the audio element immediately
    this.audioElement.src = this.currentTrack.src;
    this.audioElement.load();

    this.onTrackChange = null;
    this.onPlaybackError = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  isMusicActive() {
    if (this.muted || !this.musicEnabled) return false;
    if (this.currentTrack.type === "synth") return this.bgmPlaying;
    return !this.audioElement.paused;
  }

  selectTrack(track) {
    this.currentTrack = track;

    if (track.type === "synth") {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) { }

      if (this.musicEnabled && !this.muted) {
        this.startBGM();
      }
    } else {
      // Stop procedural synth
      this.stopBGM();

      this.audioElement.src = track.src;
      this.audioElement.load();

      if (this.musicEnabled && !this.muted) {
        this.audioElement.play().catch((err) => {
          console.warn("Could not play MP3 track:", err);
          if (this.onPlaybackError) {
            this.onPlaybackError(track, err);
          }
        });
      }
    }

    if (this.onTrackChange) {
      this.onTrackChange(track);
    }
  }

  playCurrentTrack() {
    if (this.muted || !this.musicEnabled) return;
    if (this.currentTrack.type === "synth") {
      this.startBGM();
    } else {
      this.audioElement.play().catch(e => console.warn(e));
    }
  }

  pauseCurrentTrack() {
    if (this.currentTrack.type === "synth") {
      this.stopBGM();
    } else {
      this.audioElement.pause();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("game_sound_muted", this.muted);
    this.audioElement.muted = this.muted;
    if (this.muted) {
      this.pauseCurrentTrack();
    } else if (this.musicEnabled) {
      this.playCurrentTrack();
    }
    return this.muted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem("game_music_enabled", this.musicEnabled);
    if (this.musicEnabled && !this.muted) {
      this.playCurrentTrack();
    } else {
      this.pauseCurrentTrack();
    }
    return this.musicEnabled;
  }

  startBGM() {
    if (this.muted || !this.musicEnabled || this.bgmPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    this.bgmStep = 0;
    this.bgmNextNoteTime = this.ctx.currentTime + 0.1;
    this._bgmLoop();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  _bgmLoop() {
    if (!this.bgmPlaying || this.muted || !this.ctx) return;

    const stepDuration = 0.22; // ~136 BPM eighth notes
    const currentTime = this.ctx.currentTime;

    // Schedule up to 0.4s in advance
    while (this.bgmNextNoteTime < currentTime + 0.4) {
      this._playBgmStep(this.bgmStep, this.bgmNextNoteTime, stepDuration);
      this.bgmNextNoteTime += stepDuration;
      this.bgmStep = (this.bgmStep + 1) % 32;
    }

    this.bgmTimer = setTimeout(() => this._bgmLoop(), 100);
  }

  _playBgmStep(step, time, dur) {
    if (!this.ctx) return;

    // Chord Arpeggios (Triangle / Soft Sine)
    const arpeggios = [
      // Bar 1: C maj7
      261.63, 329.63, 392.00, 493.88,
      // Bar 2: A min7
      220.00, 261.63, 329.63, 392.00,
      // Bar 3: F maj7
      174.61, 220.00, 261.63, 329.63,
      // Bar 4: G7
      196.00, 246.94, 293.66, 349.23,
      // Bar 5: E min7
      164.81, 196.00, 246.94, 293.66,
      // Bar 6: A min7
      220.00, 261.63, 329.63, 392.00,
      // Bar 7: D min7
      146.83, 174.61, 220.00, 261.63,
      // Bar 8: G
      196.00, 246.94, 293.66, 392.00
    ];

    // Bassline roots (1 per 4 steps)
    const bassRoots = [
      65.41,  // C2
      55.00,  // A1
      43.65,  // F1
      49.00,  // G1
      41.20,  // E1
      55.00,  // A1
      73.42,  // D2
      49.00   // G1
    ];

    // Sweet cozy melody (pentatonic / diatonic notes or null)
    const melody = [
      523.25, null, 659.25, null,   // C5, E5
      587.33, null, 523.25, 493.88, // D5, C5, B4
      440.00, null, 523.25, null,   // A4, C5
      493.88, null, 392.00, null,   // B4, G4
      329.63, null, 392.00, null,   // E4, G4
      440.00, null, 523.25, null,   // A4, C5
      587.33, null, 659.25, null,   // D5, E5
      587.33, null, 523.25, null    // D5, C5
    ];

    try {
      // 1. Play Arpeggio Note
      const arpFreq = arpeggios[step];
      if (arpFreq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(arpFreq, time);

        gain.gain.setValueAtTime(0.018, time);
        gain.gain.exponentialRampToValueAtTime(0.0005, time + dur * 0.95);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + dur);
      }

      // 2. Play Bass Root on beat 1 of each chord
      if (step % 4 === 0) {
        const chordIdx = Math.floor(step / 4);
        const bassFreq = bassRoots[chordIdx];
        if (bassFreq) {
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = "sine";
          bOsc.frequency.setValueAtTime(bassFreq, time);

          bGain.gain.setValueAtTime(0.035, time);
          bGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 3.8);

          bOsc.connect(bGain);
          bGain.connect(this.ctx.destination);

          bOsc.start(time);
          bOsc.stop(time + dur * 3.9);
        }
      }

      // 3. Play Lead Melody
      const melFreq = melody[step];
      if (melFreq) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = "sine";
        mOsc.frequency.setValueAtTime(melFreq, time);

        // Soft bell-like envelope
        mGain.gain.setValueAtTime(0.024, time);
        mGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 1.8);

        mOsc.connect(mGain);
        mGain.connect(this.ctx.destination);

        mOsc.start(time);
        mOsc.stop(time + dur * 1.9);
      }
    } catch (e) { }
  }

  playStep() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastStepTime < 240) return;
    this.lastStepTime = now;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(110 + Math.random() * 20, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context might be restricted before gesture
    }
  }

  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.03); // A5

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) { }
  }

  playBookOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.15);
      });
    } catch (e) { }
  }

  playBoot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // PC Boot chime: G4 -> C5 -> E5 -> G5
      const notes = [392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.07, this.ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.07 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.07);
        osc.stop(this.ctx.currentTime + i * 0.07 + 0.22);
      });
    } catch (e) { }
  }

  playPower() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) { }
  }

  playWater() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const freqs = [700, 850, 950, 1100];
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.1);
      });
    } catch (e) { }
  }

  playSleep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 493.88, 440.00, 392.00, 329.63];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.09);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.09);
        osc.stop(this.ctx.currentTime + i * 0.09 + 0.26);
      });
    } catch (e) { }
  }

  playBallHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(820, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) { }
  }

  playBallPocket() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.14);
    } catch (e) { }
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.24);
      });
    } catch (e) { }
  }

  playScratch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(360, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.36);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.38);
    } catch (e) { }
  }
}

export const sounds = new SoundSystem();
