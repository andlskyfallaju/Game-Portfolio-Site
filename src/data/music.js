/**
 * Music Playlist Configuration
 * Defines available tracks for the Retro Boombox Stereo.
 * To add or edit tracks, place .mp3 files into the assets/music/ folder.
 * ID3 metadata (Title and Artist) is also automatically parsed from your MP3 files.
 */

export const MUSIC_TRACKS = [
  {
    id: "default_chiptune",
    title: "8-Bit Cozy Beats",
    author: "Procedural Chiptune Synthesizer",
    type: "synth",
    badge: "Built-in"
  },
  {
    id: "custom_track_1",
    title: "Git City - Your GitHub as a 3D City",
    author: "Samuel Rizzon",
    src: "./assets/music/track1.mp3",
    type: "mp3",
    badge: "MP3 Track"
  },
  {
    id: "custom_track_2",
    title: "Phototropic",
    author: "Chime",
    src: "./assets/music/track2.mp3",
    type: "mp3",
    badge: "MP3 Track"
  }
];
