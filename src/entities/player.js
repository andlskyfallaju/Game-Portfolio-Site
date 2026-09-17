/**
 * Player Entity
 * Manages character position, sprite sheet animation, direction, and rendering.
 */

import { sounds } from "../engine/audio.js";

export class Player {
  constructor(x = 100, y = 118) {
    this.x = x;
    this.y = y;
    this.speed = 52; // Pixels per second

    // Foot collision box relative to (this.x, this.y)
    this.colOffsetX = 3;
    this.colOffsetY = 10;
    this.colWidth = 10;
    this.colHeight = 6;

    // Direction: 0 = Down, 1 = Left, 2 = Right, 3 = Up
    this.direction = 0;
    this.isMoving = false;

    // Walk animation cycle: 0 -> 1 -> 2 -> 1
    this.walkFrames = [0, 1, 2, 1];
    this.animIndex = 1;
    this.animTimer = 0;
    this.stepDuration = 0.14; // Seconds per walk frame

    // Selected character skin (0 to 9 in 01-generic.png)
    this.skinIndex = 0;

    // Visual dust particles
    this.particles = [];
    this.dustTimer = 0;

    // Sleeping / resting state
    this.isSleeping = false;
    this.isSitting = false;
  }

  setSkin(index) {
    this.skinIndex = Math.max(0, Math.min(9, index));
  }

  getCollisionBox() {
    return {
      x: this.x + this.colOffsetX,
      y: this.y + this.colOffsetY,
      w: this.colWidth,
      h: this.colHeight
    };
  }

  update(dt, input, collisionSystem) {
    if (this.isSleeping) {
      // Wake up if E/action or any movement key is pressed
      if (input.keys.action || input.keys.up || input.keys.down || input.keys.left || input.keys.right) {
        this.isSleeping = false;
        this.x = 64; // Safely on the right side of the bed in the open room
        this.y = 48;
        this.direction = 2; // Facing right towards the open room
        sounds.playSelect();
      }
      return;
    }

    if (this.isSitting) {
      // Stand up facing the TV if E/action or any movement key is pressed
      if (input.keys.action || input.keys.up || input.keys.down || input.keys.left || input.keys.right) {
        this.isSitting = false;
        this.x = 98;
        this.y = 46; // Spawns above the sofa facing the TV
        this.direction = 3; // Facing UP towards TV
        sounds.playSelect();
      }
      return;
    }

    let dx = 0;
    let dy = 0;

    if (input.keys.up) dy -= 1;
    if (input.keys.down) dy += 1;
    if (input.keys.left) dx -= 1;
    if (input.keys.right) dx += 1;

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      // Determine facing direction (priority to most recently pressed or horizontal/vertical)
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 2 : 1;
      } else {
        this.direction = dy > 0 ? 0 : 3;
      }

      // Normalize diagonal movement speed
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.SQRT2;
        dx *= factor;
        dy *= factor;
      }

      const moveDistX = dx * this.speed * dt;
      const moveDistY = dy * this.speed * dt;

      // Resolve movement with collision system
      const currentBox = this.getCollisionBox();
      const resolved = collisionSystem.resolveMovement(currentBox, moveDistX, moveDistY);

      this.x = resolved.x - this.colOffsetX;
      this.y = resolved.y - this.colOffsetY;

      // Advance walk animation
      this.animTimer += dt;
      if (this.animTimer >= this.stepDuration) {
        this.animTimer = 0;
        this.animIndex = (this.animIndex + 1) % this.walkFrames.length;

        // Play footstep sound on actual steps (frames 0 and 2)
        if (this.walkFrames[this.animIndex] !== 1) {
          sounds.playStep();
        }
      }

      // Dust puff particles
      this.dustTimer += dt;
      if (this.dustTimer > 0.16) {
        this.dustTimer = 0;
        this.particles.push({
          x: this.x + 8 + (Math.random() - 0.5) * 4,
          y: this.y + 15,
          vx: -dx * 6 + (Math.random() - 0.5) * 4,
          vy: -dy * 6 - 4,
          life: 0.28,
          maxLife: 0.28,
          color: "rgba(220, 190, 160, 0.6)"
        });
      }
    } else {
      // Reset to idle frame (middle frame 1)
      this.animIndex = 1;
      this.animTimer = 0;
    }

    // Update dust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, spriteImage) {
    if (!spriteImage || !spriteImage.complete) return;

    // Draw dust particles behind player
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = `rgba(215, 175, 140, ${alpha * 0.7})`;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1.5, 1.5);
    }

    if (this.isSleeping) {
      // In bed resting: character is tucked in, don't draw standing sprite
      return;
    }

    // Character sprite calculations
    // In 01-generic.png (240x128):
    // 5 character columns (each 48px wide = 3 frames of 16px)
    // 2 character rows (each 64px high = 4 directions of 16px)
    const charCol = this.skinIndex % 5;
    const charRow = Math.floor(this.skinIndex / 5);

    const frameCol = this.isSitting ? 1 : this.walkFrames[this.animIndex]; // 0, 1, 2
    const dirRow = this.isSitting ? 3 : this.direction; // 3 = Facing UP towards the TV!

    const sx = charCol * 48 + frameCol * 16;
    const sy = charRow * 64 + dirRow * 16;

    // Draw subtle shadow under character
    ctx.fillStyle = "rgba(40, 30, 50, 0.28)";
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 8), Math.round(this.y + 15), 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw character 16x16 sprite
    ctx.drawImage(
      spriteImage,
      sx, sy, 16, 16,
      Math.round(this.x), Math.round(this.y), 16, 16
    );
  }
}
