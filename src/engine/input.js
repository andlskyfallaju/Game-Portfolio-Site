/**
 * Input Management System
 * Handles keyboard (WASD/Arrows), canvas-scaled mouse coordinates, and clicks.
 */

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };

    // Virtual game canvas resolution (192 x 160)
    this.gameWidth = 192;
    this.gameHeight = 160;

    // Mouse coordinates in game pixels (0..192, 0..160)
    this.mouse = {
      x: -100,
      y: -100,
      isDown: false,
      justClicked: false
    };

    this.clickListeners = [];

    this._setupKeyboard();
    this._setupMouse();
  }

  _setupKeyboard() {
    window.addEventListener("keydown", (e) => {
      // Don't capture keys if an input/modal is focused
      if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        return;
      }

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          this.keys.up = true;
          e.preventDefault();
          break;
        case "KeyS":
        case "ArrowDown":
          this.keys.down = true;
          e.preventDefault();
          break;
        case "KeyA":
        case "ArrowLeft":
          this.keys.left = true;
          e.preventDefault();
          break;
        case "KeyD":
        case "ArrowRight":
          this.keys.right = true;
          e.preventDefault();
          break;
        case "KeyE":
        case "Space":
          this.keys.action = true;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          this.keys.up = false;
          break;
        case "KeyS":
        case "ArrowDown":
          this.keys.down = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          this.keys.right = false;
          break;
        case "KeyE":
        case "Space":
          this.keys.action = false;
          break;
      }
    });
  }

  _setupMouse() {
    const updateMousePos = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.gameWidth / rect.width;
      const scaleY = this.gameHeight / rect.height;

      this.mouse.x = (clientX - rect.left) * scaleX;
      this.mouse.y = (clientY - rect.top) * scaleY;
    };

    this.canvas.addEventListener("mousemove", (e) => {
      updateMousePos(e.clientX, e.clientY);
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouse.x = -100;
      this.mouse.y = -100;
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) { // Left click
        updateMousePos(e.clientX, e.clientY);
        this.mouse.isDown = true;
        this.mouse.justClicked = true;

        for (const listener of this.clickListeners) {
          listener(this.mouse.x, this.mouse.y);
        }
      }
    });

    window.addEventListener("mouseup", () => {
      this.mouse.isDown = false;
    });

    // Touch support for mobile devices
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateMousePos(touch.clientX, touch.clientY);
        this.mouse.isDown = true;
        this.mouse.justClicked = true;
        for (const listener of this.clickListeners) {
          listener(this.mouse.x, this.mouse.y);
        }
      }
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateMousePos(touch.clientX, touch.clientY);
      }
    }, { passive: false });

    this.canvas.addEventListener("touchend", () => {
      this.mouse.isDown = false;
    });
  }

  onClick(callback) {
    this.clickListeners.push(callback);
  }

  update() {
    // Reset frame-specific triggers
    this.mouse.justClicked = false;
  }
}
