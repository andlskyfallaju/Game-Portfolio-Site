/**
 * 8-Ball Billiards Table Simulation
 * Simulates a mini-game on the billiards table:
 * - Sinks all colored balls in 1 to 5 random shots
 * - Final shot on black 8-ball with 25% chance of scratch (white ball sinking)
 * - Auto-resets when game finishes
 */

import { sounds } from "../engine/audio.js";

export class BilliardsSimulation {
  constructor() {
    this.tableBounds = {
      x: 129,
      y: 62,
      w: 26,
      h: 44,
      minX: 132,
      maxX: 152,
      minY: 65,
      maxY: 103
    };

    this.pockets = [
      { x: 131.5, y: 64.5 }, // Top-Left
      { x: 152.5, y: 64.5 }, // Top-Right
      { x: 130.5, y: 84.0 }, // Mid-Left
      { x: 153.5, y: 84.0 }, // Mid-Right
      { x: 131.5, y: 103.5 }, // Bottom-Left
      { x: 152.5, y: 103.5 }  // Bottom-Right
    ];

    this.state = "IDLE"; // "IDLE", "AIMING", "ROLLING", "EIGHT_AIM", "EIGHT_ROLL", "GAME_OVER"
    this.totalShots = 3;
    this.currentShot = 0;
    this.scratchResult = false;
    this.statusText = "🎱 8-Ball Billiards • Click to Play";
    this.timer = 0;

    // Cue stick visual animation
    this.cueAnim = {
      visible: false,
      angle: -Math.PI / 2,
      offset: 6,
      striking: false
    };

    this.balls = [];
    this.resetTable();
  }

  resetTable() {
    this.state = "IDLE";
    this.statusText = "🎱 8-Ball Billiards • Click to Play";
    this.currentShot = 0;
    this.scratchResult = false;
    this.cueAnim.visible = false;

    // Cue Ball (White) - starts near bottom cushion
    this.cueBall = {
      x: 142,
      y: 95,
      vx: 0,
      vy: 0,
      radius: 1.4,
      color: "#ffffff",
      isCue: true,
      sunk: false
    };

    // 8-Ball (Black) - center of rack
    this.eightBall = {
      x: 142,
      y: 74,
      vx: 0,
      vy: 0,
      radius: 1.4,
      color: "#18181b",
      isEight: true,
      sunk: false
    };

    // Colored Object Balls
    const colors = [
      "#facc15", // 1 Yellow
      "#3b82f6", // 2 Blue
      "#ef4444", // 3 Red
      "#a855f7", // 4 Purple
      "#f97316", // 5 Orange
      "#22c55e", // 6 Green
      "#b91c1c"  // 7 Maroon
    ];

    // Vertical rack offsets pointing down towards cue ball
    const rackOffsets = [
      { dx: 0, dy: 3.6 },    // Lead apex ball pointing down
      { dx: -2.0, dy: 1.8 },
      { dx: 2.0, dy: 1.8 },
      { dx: -4.0, dy: 0 },
      { dx: 0, dy: 0 },      // (8-ball slot at 0, 0)
      { dx: 4.0, dy: 0 },
      { dx: -2.0, dy: -1.8 },
      { dx: 2.0, dy: -1.8 }
    ];

    this.coloredBalls = [];
    let cIdx = 0;
    for (let i = 0; i < rackOffsets.length; i++) {
      if (i === 4) continue; // Slot reserved for 8-Ball
      this.coloredBalls.push({
        x: 142 + rackOffsets[i].dx,
        y: 74 + rackOffsets[i].dy,
        vx: 0,
        vy: 0,
        radius: 1.4,
        color: colors[cIdx % colors.length],
        isCue: false,
        isEight: false,
        sunk: false
      });
      cIdx++;
    }

    this.balls = [this.cueBall, this.eightBall, ...this.coloredBalls];
  }

  interact() {
    if (this.state === "IDLE") {
      // Pick random number of shots between 1 and 5
      this.totalShots = Math.floor(Math.random() * 5) + 1;
      this.currentShot = 1;
      this.state = "AIMING";
      this.timer = 0.5;
      this.statusText = `🎱 Shot 1/${this.totalShots}: Break Shot!`;
      sounds.playSelect();
    }
  }

  update(dt) {
    if (this.state === "IDLE") return;

    if (this.state === "AIMING") {
      this.timer -= dt;
      this.cueAnim.visible = true;
      this.cueAnim.angle = -Math.PI / 2;
      this.cueAnim.offset = 4 + Math.sin(performance.now() * 0.01) * 2;

      if (this.timer <= 0) {
        this._strikeColoredShot();
      }
    } else if (this.state === "ROLLING") {
      this._updatePhysics(dt);

      // Check if all balls stopped moving
      if (this._allBallsStopped()) {
        const remainingColored = this.coloredBalls.filter(b => !b.sunk);

        if (remainingColored.length === 0 || this.currentShot >= this.totalShots) {
          // Sink any remaining colored balls so only 8-ball and cue remain
          for (const b of remainingColored) {
            b.sunk = true;
          }
          // Move to 8-ball shot!
          this.state = "EIGHT_AIM";
          this.timer = 0.8;
          this.statusText = "🎱 Final Shot: Sinking Black 8-Ball!";
        } else {
          // Next shot on colored balls
          this.currentShot++;
          this.state = "AIMING";
          this.timer = 0.6;
          this.statusText = `🎱 Shot ${this.currentShot}/${this.totalShots}: Clearing table!`;
        }
      }
    } else if (this.state === "EIGHT_AIM") {
      this.timer -= dt;
      this.cueAnim.visible = true;
      // Angle towards 8-ball
      const dx = this.eightBall.x - this.cueBall.x;
      const dy = this.eightBall.y - this.cueBall.y;
      this.cueAnim.angle = Math.atan2(dy, dx);
      this.cueAnim.offset = 4 + Math.sin(performance.now() * 0.01) * 2;

      if (this.timer <= 0) {
        this._strikeEightBallShot();
      }
    } else if (this.state === "EIGHT_ROLL") {
      this._updatePhysics(dt);

      if (this._allBallsStopped() || (this.eightBall.sunk && (this.scratchResult ? this.cueBall.sunk : true))) {
        this.state = "GAME_OVER";
        this.timer = 3.0; // Show result for 3 seconds, then reset automatically

        if (this.scratchResult) {
          this.statusText = "💥 SCRATCH! White ball sunk with 8-Ball — Scratch Loss!";
          sounds.playScratch();
        } else {
          this.statusText = "🏆 VICTORY! 8-Ball pocketed cleanly!";
          sounds.playVictory();
        }
      }
    } else if (this.state === "GAME_OVER") {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.resetTable();
      }
    }
  }

  _strikeColoredShot() {
    this.cueAnim.visible = false;
    this.state = "ROLLING";
    sounds.playBallHit();

    // Cue ball impulse upwards towards rack
    const speed = 48 + Math.random() * 20;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    this.cueBall.vx = Math.cos(angle) * speed;
    this.cueBall.vy = Math.sin(angle) * speed;

    // Scatter object balls realistically
    const remaining = this.coloredBalls.filter(b => !b.sunk);
    const ballsToSinkCount = Math.max(1, Math.ceil(remaining.length / (this.totalShots - this.currentShot + 1)));

    // Choose target balls to sink towards nearest pockets
    const toSink = remaining.slice(0, ballsToSinkCount);
    toSink.forEach((b, idx) => {
      const targetPocket = this.pockets[Math.floor(Math.random() * this.pockets.length)];
      const pdx = targetPocket.x - b.x;
      const pdy = targetPocket.y - b.y;
      const dist = Math.hypot(pdx, pdy) || 1;
      const bSpeed = 22 + Math.random() * 14;
      b.vx = (pdx / dist) * bSpeed;
      b.vy = (pdy / dist) * bSpeed;
    });

    // Other remaining balls bounce around
    remaining.slice(ballsToSinkCount).forEach(b => {
      const rndAngle = Math.random() * Math.PI * 2;
      const rndSpeed = 12 + Math.random() * 18;
      b.vx = Math.cos(rndAngle) * rndSpeed;
      b.vy = Math.sin(rndAngle) * rndSpeed;
    });
  }

  _strikeEightBallShot() {
    this.cueAnim.visible = false;
    this.state = "EIGHT_ROLL";
    sounds.playBallHit();

    // 25% chance of scratch (white ball sinks along with 8-ball)
    this.scratchResult = Math.random() < 0.25;

    // Target pocket for 8-ball
    const targetPocket = this.pockets[Math.floor(Math.random() * this.pockets.length)];
    const edx = targetPocket.x - this.eightBall.x;
    const edy = targetPocket.y - this.eightBall.y;
    const edist = Math.hypot(edx, edy) || 1;

    // Cue ball strikes 8-ball
    this.cueBall.vx = (edx / edist) * 28;
    this.cueBall.vy = (edy / edist) * 28;

    this.eightBall.vx = (edx / edist) * 32;
    this.eightBall.vy = (edy / edist) * 32;

    if (this.scratchResult) {
      // Cue ball follows into another pocket
      const scratchPocket = this.pockets[(this.pockets.indexOf(targetPocket) + 1) % this.pockets.length];
      const sdx = scratchPocket.x - this.cueBall.x;
      const sdy = scratchPocket.y - this.cueBall.y;
      const sdist = Math.hypot(sdx, sdy) || 1;
      this.cueBall.vx = (sdx / sdist) * 26;
      this.cueBall.vy = (sdy / sdist) * 26;
    }
  }

  _updatePhysics(dt) {
    const friction = 0.94;

    for (const b of this.balls) {
      if (b.sunk) continue;

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      b.vx *= friction;
      b.vy *= friction;

      if (Math.abs(b.vx) < 0.2) b.vx = 0;
      if (Math.abs(b.vy) < 0.2) b.vy = 0;

      // Bounce off cushions
      if (b.x <= this.tableBounds.minX) {
        b.x = this.tableBounds.minX;
        b.vx = -b.vx * 0.8;
      }
      if (b.x >= this.tableBounds.maxX) {
        b.x = this.tableBounds.maxX;
        b.vx = -b.vx * 0.8;
      }
      if (b.y <= this.tableBounds.minY) {
        b.y = this.tableBounds.minY;
        b.vy = -b.vy * 0.8;
      }
      if (b.y >= this.tableBounds.maxY) {
        b.y = this.tableBounds.maxY;
        b.vy = -b.vy * 0.8;
      }

      // Check pocket sinking
      for (const p of this.pockets) {
        const dist = Math.hypot(b.x - p.x, b.y - p.y);
        if (dist < 2.4) {
          b.sunk = true;
          b.vx = 0;
          b.vy = 0;
          sounds.playBallPocket();
          break;
        }
      }
    }
  }

  _allBallsStopped() {
    for (const b of this.balls) {
      if (!b.sunk && (Math.abs(b.vx) > 0.3 || Math.abs(b.vy) > 0.3)) {
        return false;
      }
    }
    return true;
  }

  draw(ctx) {
    // Draw all balls currently on table
    for (const b of this.balls) {
      if (b.sunk) continue;

      // Subtle shadow under ball
      ctx.fillStyle = "rgba(10, 30, 15, 0.45)";
      ctx.beginPath();
      ctx.arc(Math.round(b.x), Math.round(b.y) + 0.8, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ball circle
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(Math.round(b.x), Math.round(b.y), b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ball specular shine / 8 mark
      if (b.isEight) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, 1);
      } else if (b.isCue) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(Math.round(b.x) - 0.5, Math.round(b.y) - 0.5, 1, 1);
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(Math.round(b.x) - 0.5, Math.round(b.y) - 0.5, 1, 1);
      }
    }

    // Draw animated cue stick when aiming
    if (this.cueAnim.visible && !this.cueBall.sunk) {
      const angle = this.cueAnim.angle;
      const offset = this.cueAnim.offset;
      const startX = this.cueBall.x - Math.cos(angle) * offset;
      const startY = this.cueBall.y - Math.sin(angle) * offset;
      const endX = startX - Math.cos(angle) * 14;
      const endY = startY - Math.sin(angle) * 14;

      ctx.strokeStyle = "#e2b17b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Cue tip
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX - Math.cos(angle) * 1.5, startY - Math.sin(angle) * 1.5);
      ctx.stroke();
    }
  }
}
