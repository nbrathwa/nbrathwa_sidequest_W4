/*
WorldLevel.js (Example 5)

WorldLevel wraps ONE level object from levels.json and provides:
- Theme colours (background/platform/blob)
- Physics parameters that influence the player (gravity, jump velocity)
- Spawn position for the player (start)
- An array of Platform instances
- A couple of helpers to size the canvas to fit the geometry

This is directly inspired by your original blob sketch’s responsibilities: 
- parse JSON
- map platforms array
- apply theme + physics
- infer canvas size

Expected JSON shape for each level (from your provided file): 
{
  "name": "Intro Steps",
  "gravity": 0.65,
  "jumpV": -11.0,
  "theme": { "bg":"...", "platform":"...", "blob":"..." },
  "start": { "x":80, "y":220, "r":26 },
  "platforms": [ {x,y,w,h}, ... ]
}
*/

class WorldLevel {
  constructor(levelJson) {
    // A readable label for HUD.
    this.name = levelJson.name || "Level";

    // Theme defaults + override with JSON.
    this.theme = Object.assign(
      { bg: "#F0F0F0", platform: "#C8C8C8", blob: "#1478FF" },
      levelJson.theme || {},
    );

    // Physics knobs (the blob player will read these).
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Player spawn data.
    // Use optional chaining so levels can omit fields safely.
    this.start = {
      x: levelJson.start?.x ?? 80,
      y: levelJson.start?.y ?? 180,
      r: levelJson.start?.r ?? 26,
    };

    // Build the world platforms from JSON tile data and explicit platforms.
    this.platforms = [];
    const tileSize = levelJson.tileSize;
    const tileMap = levelJson.tileMap;

    if (tileMap && tileSize) {
      for (let row = 0; row < tileMap.length; row++) {
        const rowData = tileMap[row];
        for (let col = 0; col < rowData.length; col++) {
          if (rowData[col] === "1") {
            this.platforms.push(
              new Platform({
                x: col * tileSize,
                y: row * tileSize,
                w: tileSize,
                h: tileSize,
              }),
            );
          }
        }
      }
    }

    this.platforms.push(...(levelJson.platforms || []).map((p) => new Platform(p)));

    // A goal area that triggers the next level when reached.
    this.goal = levelJson.goal ? Object.assign({ color: "#FFD700" }, levelJson.goal) : null;
  }

  /*
  If you want the canvas to fit the world, you can infer width/height by
  finding the maximum x+w and y+h across all platforms and the goal.
  */
  inferWidth(defaultW = 640) {
    let maxX = 0;

    for (const p of this.platforms) {
      maxX = max(maxX, p.x + p.w);
    }
    if (this.goal) {
      maxX = max(maxX, this.goal.x + this.goal.w);
    }

    return maxX || defaultW;
  }

  inferHeight(defaultH = 360) {
    let maxY = 0;

    for (const p of this.platforms) {
      maxY = max(maxY, p.y + p.h);
    }
    if (this.goal) {
      maxY = max(maxY, this.goal.y + this.goal.h);
    }

    return maxY || defaultH;
  }

  /*
  Draw only the world (background + platforms).
  The player draws itself separately, after the world is drawn.
  */
  drawWorld() {
    background(color(this.theme.bg));
    for (const p of this.platforms) {
      p.draw(color(this.theme.platform));
    }

    if (this.goal) {
      fill(color(this.goal.color));
      rect(this.goal.x, this.goal.y, this.goal.w, this.goal.h);
    }
  }
}
