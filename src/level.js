import { distBetweenPoints } from "./utils.js";
import { Constants } from "./constants.js";
import { Ship } from "./ship.js";
import { ctx, canvas } from "./index.js";
import { Asteroids } from "./asteroids.js";

export class Level {
  asteroids;
  ship;
  stage = -1;
  previousLevel;
  musicLibrary;
  game;

  constructor(musicLibrary, previousLevel, game) {
    this.game = game;
    this.ship = new Ship(musicLibrary);
    this.musicLibrary = musicLibrary;
    this.previousLevel = previousLevel;
  }

  detectLaserHitsAsteroids() {
    for (let i = this.asteroids.belt.length - 1; i >= 0; i -= 1) {
      // grab the asteroid properties
      const asteroidX = this.asteroids.belt[i].x;
      const asteroidY = this.asteroids.belt[i].y;
      const asteroidR = this.asteroids.belt[i].r;
      // loop over the laser
      for (let j = this.ship.laser.bullets.length - 1; j >= 0; j -= 1) {
        // grab the laser properties
        const laserX = this.ship.laser.bullets[j].x;
        const laserY = this.ship.laser.bullets[j].y;
        // detect hits
        if (
          this.ship.laser.bullets[j].explodeTime === 0 &&
          distBetweenPoints(asteroidX, asteroidY, laserX, laserY) < asteroidR
        ) {
          // destroy the asteroid and activate the laser explosion
          this.asteroids.destroy(i);
          this.ship.laser.bullets[j].explodeTime = Math.ceil(
            Constants.LASER_EXPLODE_DUR * Constants.FPS,
          );
          break;
        }
      }
    }
  }

  checkShipCollidesAsteroids(exploding) {
    if (!exploding) {
      // only check when not blinking
      if (this.ship.blinkNum === 0 && !this.ship.dead) {
        for (let i = 0; i < this.asteroids.belt.length; i += 1) {
          if (
            distBetweenPoints(
              this.ship.x,
              this.ship.y,
              this.asteroids.belt[i].x,
              this.asteroids.belt[i].y,
            ) <
            this.ship.r + this.asteroids.belt[i].r
          ) {
            this.ship.explode();
            this.asteroids.destroy(i);
            break;
          }
        }
      }
      // rotate the ship
      this.ship.a += this.ship.rot;
      // move the ship
      this.ship.x += this.ship.thrust.x;
      this.ship.y += this.ship.thrust.y;
      return;
    }
    // reduce the explode time
    this.ship.explodeTime -= 1;
    // reset the ship after the explosion has finished
    if (this.ship.explodeTime === 0) {
      this.lives -= 1;
      if (this.lives === 0) {
        this.gameOver();
        return;
      }
      this.ship = new Ship(this.musicLibrary);
    }
  }

  nextStage() {
    this.game.lives = Constants.GAME_LIVES;
    this.game.score = 0;
    this.game.level.ship = new Ship(this.musicLibrary);
    // get the high score from local storage
    let scoreStr = localStorage.getItem(Constants.SAVE_KEY_SCORE);
    this.game.scoreHigh = scoreStr == null ? 0 : parseInt(scoreStr);
    this.musicLibrary.background.setAsteroidRatio(1);
    const stage =
      this.previousLevel != null ? this.previousLevel.stage : this.stage;
    this.stage = stage + 1;
    this.game.text = "Level " + (this.stage + 1);
    this.game.textAlpha = 1.0;
    this.asteroids = new Asteroids(
      this.musicLibrary,
      this.ship,
      this,
      this.game,
    );
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
