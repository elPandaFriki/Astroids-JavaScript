import { Constants } from "./constants";
import { MusicLibrary } from "./musicLibrary";
import { Level } from "./level";
import { ctx, canvas } from "./index.js";

export class Game {
  lives;
  score;
  scoreHigh;
  musicLibrary = new MusicLibrary();
  level = new Level(this.musicLibrary, null, this);
  text;
  textAlpha;

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
  }

  reset() {
    this.level.nextStage();
  }

  gameOver() {
    this.level.ship.dead = true;
    this.text = "Game Over";
    this.textAlpha = 1.0;
  }

  /** @type {KeyboardEvent} */
  keyDown(ev) {
    if (this.level.ship.dead) {
      return;
    }
    switch (ev.keyCode) {
      case 32: {
        // space bar (shoot laser)
        this.level.ship.laser.shoot();
        return;
      }
      case 37: {
        // left arrow (rotate ship left)
        this.level.ship.rot =
          ((Constants.SHIP_TURN_SPD / 180) * Math.PI) / Constants.FPS;
        return;
      }
      case 38: {
        // up arrow (thrust the ship forward)
        this.level.ship.thrusting = true;
        return;
      }
      case 39: {
        // right arrow (rotate ship right)
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
    switch (ev.keyCode) {
      case 32: {
        // space bar (allow shooting again)
        this.level.ship.laser.canShoot = true;
        return;
      }
      case 37: {
        // left arrow (stop rotating left)
        this.level.ship.rot = 0;
        return;
      }
      case 38: {
        // up arrow (stop thrusting)
        this.level.ship.thrusting = false;
        return;
      }
      case 39: {
        // right arrow (stop rotating right)
        this.level.ship.rot = 0;
        return;
      }
    }
  }

  drawGameText() {
    if (this.textAlpha >= 0) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, " + this.textAlpha + ")";
      ctx.font = "small-caps " + Constants.TEXT_SIZE + "px dejavu sans mono";
      ctx.fillText(this.text, canvas.width / 2, canvas.height * 0.75);
      this.textAlpha -= 1.0 / Constants.TEXT_FADE_TIME / Constants.FPS;
      return;
    }
    if (!this.level.ship.dead) {
      return;
    }
    // after "game over" fades, start a new game
    this.reset();
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
    this.level.ship.drawThruster(blinkOn, exploding);
    this.level.ship.draw(blinkOn, exploding);
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
    const blinkOn = this.level.ship.blinkNum % 2 === 0;
    const exploding = this.level.ship.explodeTime > 0;
    this.musicLibrary.background.tick();
    this.draw(blinkOn, exploding);
    this.checkEvents(exploding);
    this.moveElements();
  }
}
