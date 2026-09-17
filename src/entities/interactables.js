/**
 * Interactables System
 * Manages bounding boxes for individual books on the bookshelf,
 * plus all other room furniture (PC, Bed, Lamp, TV, Plant, etc.).
 */

import { PROJECTS } from "../data/projects.js";
import { sounds } from "../engine/audio.js";

export class InteractableManager {
  constructor() {
    this.books = this._generateBookHitboxes();
    this.furniture = this._generateFurnitureHitboxes();
    this.hoveredItem = null;
    this.lastHoveredId = null;

    // Visual interaction feedback particles
    this.sparks = [];
  }

  _generateBookHitboxes() {
    // Bookshelf in room.png: x=112..176, y=16..48
    // Shelf 1 (Left): x=112..144
    // Shelf 2 (Right): x=144..176
    // Upper row books: y=31..36
    // Middle row books: y=37..42
    // Bottom row books: y=43..47

    const bookHitboxes = [];
    const bookWidth = 6.5;

    // Shelf 1 Top Row (Projects 0..3)
    for (let i = 0; i < 4 && i < PROJECTS.length; i++) {
      const proj = PROJECTS[i];
      bookHitboxes.push({
        type: "book",
        id: proj.id,
        project: proj,
        name: `📖 Book: "${proj.title}"`,
        prompt: "Click to read project summary",
        x: 115 + i * 6.5,
        y: 31,
        w: 6,
        h: 5.5,
        color: proj.spineColor
      });
    }

    // Shelf 1 Middle Row (Projects 4..7)
    for (let i = 4; i < 8 && i < PROJECTS.length; i++) {
      const proj = PROJECTS[i];
      bookHitboxes.push({
        type: "book",
        id: proj.id,
        project: proj,
        name: `📖 Book: "${proj.title}"`,
        prompt: "Click to read project summary",
        x: 115 + (i - 4) * 6.5,
        y: 37,
        w: 6,
        h: 5.5,
        color: proj.spineColor
      });
    }

    return bookHitboxes;
  }

  _generateFurnitureHitboxes() {
    return [
      {
        type: "furniture",
        id: "bookshelf_general",
        name: "📚 Project Bookshelf",
        prompt: "Click to browse all GitHub projects",
        x: 112,
        y: 16,
        w: 64,
        h: 32,
        priority: 1 // Lower priority than individual books
      },
      {
        type: "furniture",
        id: "pc_desk",
        name: "🖥️ Battlestation PC",
        prompt: "Click to power on & open Terminal",
        x: 28,
        y: 84,
        w: 34,
        h: 40,
        priority: 2
      },
      {
        type: "furniture",
        id: "bed",
        name: "🛏️ Cozy Bed",
        prompt: "Click to rest in bed ([E] to wake)",
        x: 16,
        y: 28,
        w: 32,
        h: 36,
        priority: 2
      },
      {
        type: "furniture",
        id: "lamp",
        name: "💡 Nightstand Lamp",
        prompt: "Click to toggle Day / Night mode",
        x: 48,
        y: 24,
        w: 16,
        h: 24,
        priority: 2
      },
      {
        type: "furniture",
        id: "tv",
        name: "📺 Retro Console Screen",
        prompt: "Click to toggle console demo",
        x: 80,
        y: 16,
        w: 28,
        h: 36,
        priority: 2
      },
      {
        type: "furniture",
        id: "plant",
        name: "🌿 Pixel Monstera",
        prompt: "Click to water plant",
        x: 14,
        y: 80,
        w: 16,
        h: 32,
        priority: 2
      },
      {
        type: "furniture",
        id: "painting",
        name: "🖼️ Pixel Landscape Art",
        prompt: "Click to view artwork note",
        x: 16,
        y: 16,
        w: 32,
        h: 14,
        priority: 2
      },
      {
        type: "furniture",
        id: "window",
        name: "🪟 Bedroom Window",
        prompt: "Click to cycle weather",
        x: 64,
        y: 16,
        w: 16,
        h: 14,
        priority: 2
      },
      {
        type: "furniture",
        id: "sofa",
        name: "🛋️ Blue Velvet Sofa",
        prompt: "Click to sit down ([E] to stand up)",
        x: 80,
        y: 64,
        w: 32,
        h: 16,
        priority: 2
      },
      {
        type: "furniture",
        id: "billiards_table",
        name: "🎱 8-Ball Billiards",
        prompt: "Click to simulate game",
        x: 126,
        y: 48,
        w: 32,
        h: 72,
        priority: 2
      },
      {
        type: "furniture",
        id: "stereo",
        name: "📻 Retro Stereo Boombox",
        prompt: "Click to choose music tracks",
        x: 156,
        y: 124,
        w: 18,
        h: 18,
        priority: 2
      },
      {
        type: "furniture",
        id: "door",
        name: "🚪 Entrance Door",
        prompt: "Click for Contact & Socials",
        x: 96,
        y: 128,
        w: 16,
        h: 16,
        priority: 2
      }
    ];
  }

  update(mouse) {
    let hovered = null;

    // Check individual books first (highest specificity)
    for (const b of this.books) {
      if (
        mouse.x >= b.x &&
        mouse.x <= b.x + b.w &&
        mouse.y >= b.y &&
        mouse.y <= b.y + b.h
      ) {
        hovered = b;
        break;
      }
    }

    // If not hovering over a book, check other furniture
    if (!hovered) {
      // Sort so higher priority items check before general bookshelf
      const sorted = [...this.furniture].sort((a, b) => (b.priority || 0) - (a.priority || 0));
      for (const f of sorted) {
        if (
          mouse.x >= f.x &&
          mouse.x <= f.x + f.w &&
          mouse.y >= f.y &&
          mouse.y <= f.y + f.h
        ) {
          hovered = f;
          break;
        }
      }
    }

    this.hoveredItem = hovered;

    // Play retro select blip on new hover
    if (hovered && hovered.id !== this.lastHoveredId) {
      sounds.playSelect();
      this.lastHoveredId = hovered.id;
    } else if (!hovered) {
      this.lastHoveredId = null;
    }

    // Update spark particles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.016;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  spawnSparks(x, y, color = "#ffea78") {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.4;
      const speed = 0.5 + Math.random() * 1.2;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35,
        maxLife: 0.35,
        color: color
      });
    }
  }

  draw(ctx) {
    // Draw spark particles
    for (const s of this.sparks) {
      const a = Math.max(0, s.life / s.maxLife);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = a;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1.5, 1.5);
    }
    ctx.globalAlpha = 1.0;

    // Draw hover outline and highlight
    if (this.hoveredItem) {
      const item = this.hoveredItem;
      const pulse = (Math.sin(performance.now() * 0.008) + 1) * 0.5;

      if (item.type === "book") {
        // Highlight individual book spine
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + pulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.floor(item.x) - 0.5, Math.floor(item.y) - 0.5, item.w + 1, item.h + 1);

        // Little floating glow marker above book
        ctx.fillStyle = item.color || "#fff";
        ctx.fillRect(Math.round(item.x + item.w / 2) - 1, Math.round(item.y - 2), 2, 2);
      } else {
        // Highlight furniture bounding box
        ctx.strokeStyle = `rgba(255, 240, 150, ${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(Math.floor(item.x) + 0.5, Math.floor(item.y) + 0.5, item.w - 1, item.h - 1);
        ctx.setLineDash([]);
      }
    }
  }
}
