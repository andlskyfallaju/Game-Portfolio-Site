/**
 * Collision Management System
 * Defines solid bounding boxes for walls and furniture,
 * and resolves player movement with smooth sliding along obstacles.
 */

export class CollisionSystem {
  constructor() {
    // Solid obstacles in native room coordinates (192 x 160)
    this.colliders = [
      // Outer Room Boundaries
      { id: "wall_top", x: 0, y: 0, w: 192, h: 28 },
      { id: "wall_bottom", x: 0, y: 144, w: 192, h: 20 },
      { id: "wall_left_upper", x: 0, y: 0, w: 16, h: 64 },
      { id: "wall_divider", x: 0, y: 62, w: 64, h: 18 }, // Dividing wall between bedroom and PC nook
      { id: "wall_left_lower", x: 0, y: 78, w: 16, h: 80 },
      { id: "wall_right", x: 176, y: 0, w: 20, h: 160 },

      // Furniture Solid Obstacles
      { id: "bed", x: 16, y: 28, w: 32, h: 34 },
      { id: "nightstand_lamp", x: 48, y: 28, w: 16, h: 18 },
      { id: "tv_unit", x: 80, y: 24, w: 28, h: 22 },
      { id: "bookshelves", x: 112, y: 24, w: 64, h: 22 },
      { id: "sofa", x: 80, y: 64, w: 30, h: 14 },
      { id: "billiards_table", x: 129, y: 62, w: 26, h: 44 }, // Pool table solid box; top/bottom cushions can be walked over
      { id: "stereo", x: 156, y: 126, w: 18, h: 18 }, // Retro Boombox in bottom-right corner
      { id: "pc_desk", x: 30, y: 92, w: 26, h: 22 },
      { id: "monstera_plant", x: 14, y: 92, w: 16, h: 18 }
    ];
  }

  /**
   * Check if a given bounding box intersects any solid collider
   */
  checkCollision(box) {
    for (const c of this.colliders) {
      if (
        box.x < c.x + c.w &&
        box.x + box.w > c.x &&
        box.y < c.y + c.h &&
        box.y + box.h > c.y
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Smooth movement resolver: tries desired (dx, dy),
   * falling back to sliding along X or Y independently if blocked.
   */
  resolveMovement(playerBox, dx, dy) {
    let newX = playerBox.x;
    let newY = playerBox.y;

    // Test X movement
    if (dx !== 0) {
      const testBoxX = { x: playerBox.x + dx, y: playerBox.y, w: playerBox.w, h: playerBox.h };
      if (!this.checkCollision(testBoxX)) {
        newX += dx;
      }
    }

    // Test Y movement
    if (dy !== 0) {
      const testBoxY = { x: newX, y: playerBox.y + dy, w: playerBox.w, h: playerBox.h };
      if (!this.checkCollision(testBoxY)) {
        newY += dy;
      }
    }

    return { x: newX, y: newY };
  }
}
