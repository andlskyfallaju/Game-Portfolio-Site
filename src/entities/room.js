/**
 * Room Environment & Rendering System
 * Draws the base room (house1.png), dynamic furniture states (PC screen, TV, Lamp),
 * Day/Night ambient lighting with radial light sources, and foreground elements.
 */

export class Room {
  constructor(roomImg, furnImg) {
    this.roomImg = roomImg;
    this.furnImg = furnImg;

    // Interactive states
    this.pcOn = true;
    this.tvOn = false;
    this.lampOn = true;
    this.isNight = false;
    this.weather = "sun"; // "sun", "stars", "rain"

    // Sleep "Zzz" particle system
    this.zzzParticles = [];
    this.zzzTimer = 0;

    // Window rain particles
    this.rainParticles = [];
    for (let i = 0; i < 15; i++) {
      this.rainParticles.push({
        x: 64 + Math.random() * 16,
        y: 16 + Math.random() * 14,
        vy: 30 + Math.random() * 20
      });
    }

    // TV animation frame
    this.tvFrame = 0;
    this.tvTimer = 0;

    // Stereo music note particles
    this.musicParticles = [];
    this.musicTimer = 0;
  }

  update(dt, playerIsSleeping, isMusicPlaying = false) {
    // TV animation
    if (this.tvOn) {
      this.tvTimer += dt;
      if (this.tvTimer > 0.4) {
        this.tvTimer = 0;
        this.tvFrame = (this.tvFrame + 1) % 2;
      }
    }

    // Window rain
    if (this.weather === "rain") {
      for (const drop of this.rainParticles) {
        drop.y += drop.vy * dt;
        if (drop.y > 30) {
          drop.y = 16;
          drop.x = 64 + Math.random() * 16;
        }
      }
    }

    // Zzz particles if player is sleeping in bed
    if (playerIsSleeping) {
      this.zzzTimer += dt;
      if (this.zzzTimer > 0.7) {
        this.zzzTimer = 0;
        this.zzzParticles.push({
          x: 28 + (Math.random() - 0.5) * 6,
          y: 40,
          vy: -10,
          vx: 3,
          size: 1,
          life: 2.0,
          maxLife: 2.0
        });
      }
    }

    for (let i = this.zzzParticles.length - 1; i >= 0; i--) {
      const z = this.zzzParticles[i];
      z.y += z.vy * dt;
      z.x += Math.sin(z.life * 4) * 0.4;
      z.life -= dt;
      if (z.life <= 0) {
        this.zzzParticles.splice(i, 1);
      }
    }

    // Music note particles when music is playing
    if (isMusicPlaying) {
      this.musicTimer += dt;
      if (this.musicTimer > 0.8) {
        this.musicTimer = 0;
        const notes = ["♪", "♫"];
        const colors = ["#f472b6", "#c084fc", "#60a5fa", "#34d399"];
        this.musicParticles.push({
          x: 164 + (Math.random() - 0.5) * 6,
          y: 124,
          vx: (Math.random() - 0.5) * 4,
          vy: -12 - Math.random() * 6,
          char: notes[Math.floor(Math.random() * notes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 2.2,
          maxLife: 2.2
        });
      }
    }

    for (let i = this.musicParticles.length - 1; i >= 0; i--) {
      const m = this.musicParticles[i];
      m.y += m.vy * dt;
      m.x += Math.sin(m.life * 3) * 0.3;
      m.life -= dt;
      if (m.life <= 0) {
        this.musicParticles.splice(i, 1);
      }
    }
  }

  drawBackground(ctx) {
    if (!this.roomImg || !this.roomImg.complete) return;

    // Draw base room
    ctx.drawImage(this.roomImg, 0, 0);

    // Weather outside window (x: 64..80, y: 16..30)
    if (this.weather === "rain") {
      ctx.fillStyle = "rgba(120, 180, 255, 0.7)";
      for (const drop of this.rainParticles) {
        ctx.fillRect(Math.round(drop.x), Math.round(drop.y), 1, 2);
      }
    } else if (this.isNight && this.weather === "stars") {
      // Tiny twinkling stars in the window
      ctx.fillStyle = "#fff";
      const t = performance.now() * 0.005;
      if (Math.sin(t) > 0) ctx.fillRect(68, 20, 1, 1);
      if (Math.cos(t * 1.3) > 0) ctx.fillRect(74, 23, 1, 1);
      if (Math.sin(t * 0.8) > 0) ctx.fillRect(71, 26, 1, 1);
    }

    // Dynamic PC Screen:
    // room.png already has the full PC build baked in.
    // When pcOn is true, we only overlay the active glowing smiley face inside the screen glass!
    if (this.furnImg && this.furnImg.complete) {
      if (this.pcOn) {
        ctx.drawImage(this.furnImg, 5, 375, 15, 9, 38, 87, 15, 9);
      }

      // Dynamic TV / Console screen:
      // When tvOn is true, overlay the active TV console with the animated cat screen
      if (this.tvOn) {
        ctx.drawImage(this.furnImg, 0, 320, 32, 32, 80, 16, 32, 32);
      }
    }
  }

  drawForeground(ctx, player) {
    if (!this.roomImg || !this.roomImg.complete) return;

    // Y-sorting foreground overlays:
    // Couch front overlay: covers player body when walking behind couch or when sitting, leaving head peeking out
    if ((player.isSitting || player.y < 64) && player.x >= 76 && player.x <= 116) {
      ctx.drawImage(this.roomImg, 80, 64, 32, 16, 80, 64, 32, 16);
    }

    // If player is standing behind the vertical billiards table, redraw table front
    if (player.y < 70 && player.x >= 128 && player.x <= 156) {
      ctx.drawImage(this.roomImg, 129, 62, 26, 44, 129, 62, 26, 44);
    }

    // If player is standing behind the stereo, redraw stereo in front
    if (player.y < 132 && player.x >= 154 && player.x <= 176) {
      ctx.drawImage(this.roomImg, 158, 126, 16, 16, 158, 126, 16, 16);
    }

    // Draw Zzz sleep particles
    for (const z of this.zzzParticles) {
      const alpha = Math.max(0, z.life / z.maxLife);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillText("Z", Math.round(z.x), Math.round(z.y));
    }

    // Draw floating music note particles from the stereo
    if (this.musicParticles) {
      for (const m of this.musicParticles) {
        const alpha = Math.max(0, m.life / m.maxLife);
        ctx.fillStyle = m.color || `rgba(244, 114, 182, ${alpha})`;
        ctx.font = "7px sans-serif";
        ctx.fillText(m.char, Math.round(m.x), Math.round(m.y));
      }
    }
  }

  drawLighting(ctx) {
    // Ambient Day/Night & Lamp Lighting Overlay
    if (!this.isNight && !this.lampOn) {
      // Normal daylight, no special overlay needed
      return;
    }

    const lightCanvas = document.createElement("canvas");
    lightCanvas.width = 192;
    lightCanvas.height = 160;
    const lctx = lightCanvas.getContext("2d");

    if (this.isNight) {
      // Dark room ambient wash
      lctx.fillStyle = "rgba(18, 14, 38, 0.72)";
      lctx.fillRect(0, 0, 192, 160);

      // Night window moonlight
      const moonGrad = lctx.createRadialGradient(72, 22, 2, 72, 22, 36);
      moonGrad.addColorStop(0, "rgba(200, 220, 255, 0.35)");
      moonGrad.addColorStop(1, "rgba(200, 220, 255, 0)");
      lctx.fillStyle = moonGrad;
      lctx.globalCompositeOperation = "destination-out";
      lctx.beginPath();
      lctx.arc(72, 22, 36, 0, Math.PI * 2);
      lctx.fill();
      lctx.globalCompositeOperation = "source-over";
    }

    if (this.lampOn) {
      // Lamp radial warm glow (Lamp at x=56, y=36)
      const lampGrad = lctx.createRadialGradient(56, 36, 4, 56, 36, this.isNight ? 50 : 28);
      lampGrad.addColorStop(0, this.isNight ? "rgba(255, 220, 130, 0.85)" : "rgba(255, 230, 150, 0.35)");
      lampGrad.addColorStop(0.6, this.isNight ? "rgba(255, 180, 80, 0.45)" : "rgba(255, 200, 100, 0.15)");
      lampGrad.addColorStop(1, "rgba(255, 180, 80, 0)");

      if (this.isNight) {
        lctx.globalCompositeOperation = "destination-out";
        lctx.fillStyle = lampGrad;
        lctx.beginPath();
        lctx.arc(56, 36, 50, 0, Math.PI * 2);
        lctx.fill();
        lctx.globalCompositeOperation = "source-over";
      }

      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(56, 36, this.isNight ? 50 : 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // PC Screen glow if on
    if (this.pcOn) {
      const pcGrad = ctx.createRadialGradient(40, 94, 2, 40, 94, 24);
      pcGrad.addColorStop(0, "rgba(140, 220, 255, 0.28)");
      pcGrad.addColorStop(1, "rgba(140, 220, 255, 0)");
      ctx.fillStyle = pcGrad;
      ctx.beginPath();
      ctx.arc(40, 94, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.isNight) {
      ctx.drawImage(lightCanvas, 0, 0);
    }
  }
}
