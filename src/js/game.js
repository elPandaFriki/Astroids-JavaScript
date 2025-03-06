import { Constants } from "./constants.js";
import { MusicLibrary } from "./musicLibrary.js";
import { Level } from "./level.js";
import { ctx, canvas } from "./canvas.js";

export class Game {
  lives;
  score = 0;
  scoreHigh;
  musicLibrary = new MusicLibrary();
  level = new Level(this.musicLibrary, null, this);
  text;
  textAlpha;
  paused = false;
  scoreLadder = [];

  constructor() {
    this.level = new Level(this.musicLibrary, null, this);
    this.reset();
    // set up event handlers
    document.addEventListener("keydown", (e) => {
      this.keyDown(e);
    });
    document.addEventListener("keyup", (e) => {
      this.keyUp(e);
    });
    // set up the game loop
    setInterval(() => {
      this.update();
    }, 1000 / Constants.FPS);
    this.start();
  }

  start() {
    this.paused = false;
  }

  reset() {
    this.level.nextStage();
  }

  gameOver() {
    this.level.ship.dead = true;
    this.scoreLadder.push(this.score);
    const scoreLadder = this.scoreLadder.sort((a, b) => b - a);
    const ladder = scoreLadder.slice(0, Constants.SCORE_LADDER_SIZE);
    localStorage.setItem(Constants.SAVE_KEY_SCORE, JSON.stringify(ladder));
    this.pause();
  }

  /** @type {KeyboardEvent} */
  keyDown(ev) {
    if (this.level.ship.dead) {
      return;
    }
    if (this.paused) {
      return;
    }
    switch (ev.code) {
      case "Space": {
        // shoot laser
        this.level.ship.laser.shoot();
        return;
      }
      case "ArrowLeft": {
        // rotate ship left
        this.level.ship.rot =
          ((Constants.SHIP_TURN_SPD / 180) * Math.PI) / Constants.FPS;
        return;
      }
      case "ArrowUp": {
        // thrust the ship forward
        this.level.ship.thrusting = true;
        return;
      }
      case "ArrowRight": {
        // rotate ship right
        this.level.ship.rot =
          ((-Constants.SHIP_TURN_SPD / 180) * Math.PI) / Constants.FPS;
        return;
      }
      default: {
        return;
      }
    }
  }

  /** @type {KeyboardEvent} */
  keyUp(ev) {
    if (this.level.ship.dead) {
      return;
    }
    switch (ev.code) {
      case "Escape": {
        if (this.paused) {
          this.start();
          return;
        }
        this.pause();
        return;
      }
      case "Space": {
        // allow shooting again
        this.level.ship.laser.canShoot = true;
        return;
      }
      case "ArrowLeft": {
        // stop rotating left
        this.level.ship.rot = 0;
        return;
      }
      case "ArrowUp": {
        // stop thrusting
        this.level.ship.thrusting = false;
        return;
      }
      case "ArrowRight": {
        // stop rotating right
        this.level.ship.rot = 0;
        return;
      }
    }
  }

  pause() {
    this.paused = true;
  }

  drawGameText() {
    if (this.level.ship.dead) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.font = "small-caps " + Constants.TEXT_SIZE + "px dejavu sans mono";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      return;
    }
    if (this.paused) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.font = "small-caps " + Constants.TEXT_SIZE + "px dejavu sans mono";
      ctx.fillText("PAUSE", canvas.width / 2, canvas.height / 2);
    }
    if (this.textAlpha >= 0) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, " + this.textAlpha + ")";
      ctx.font = "small-caps " + Constants.TEXT_SIZE + "px dejavu sans mono";
      ctx.fillText(this.text, canvas.width / 2, canvas.height * 0.75);
      this.textAlpha -= 1.0 / Constants.TEXT_FADE_TIME / Constants.FPS;
      return;
    }
  }

  drawLives(exploding) {
    for (let i = 0; i < this.lives; i += 1) {
      this.level.ship.drawBody(
        Constants.SHIP_SIZE + i * Constants.SHIP_SIZE * 1.2,
        Constants.SHIP_SIZE,
        0.5 * Math.PI,
        exploding && i === this.lives - 1 ? "red" : "white",
      );
    }
  }

  drawScore() {
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = Constants.TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(
      this.score,
      canvas.width - Constants.SHIP_SIZE / 2,
      Constants.SHIP_SIZE,
    );
  }

  drawHighScore() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = Constants.TEXT_SIZE * 0.75 + "px dejavu sans mono";
    ctx.fillText(
      "BEST " + this.scoreHigh,
      canvas.width / 2,
      Constants.SHIP_SIZE,
    );
  }

  draw(blinkOn, exploding) {
    this.level.draw();
    this.level.asteroids.draw();
    this.level.ship.draw(blinkOn, exploding);
    this.level.ship.drawThruster(blinkOn, exploding);
    this.level.ship.drawCollisionCircle();
    this.level.ship.drawCenterDot();
    this.level.ship.laser.draw();
    this.drawGameText();
    this.drawLives(exploding);
    this.drawScore();
    this.drawHighScore();
  }

  moveElements() {
    this.level.ship.laser.move();
    this.level.asteroids.move();
  }

  checkEvents(exploding) {
    this.level.detectLaserHitsAsteroids();
    this.level.checkShipCollidesAsteroids(exploding);
    this.level.ship.handleEdgeOfScreen();
  }

  update() {
    const blinkOn = this.paused ? true : this.level.ship.blinkNum % 2 === 0;
    const exploding = this.level.ship.explodeTime > 0;
    this.draw(blinkOn, exploding);
    if (this.paused) {
      return;
    }
    this.musicLibrary.background.tick();
    this.checkEvents(exploding);
    this.moveElements();
  }
}
