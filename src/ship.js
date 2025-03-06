import { Constants } from "./constants.js";
import { canvas, ctx } from "./index.js";
import { Laser } from "./laser.js";

export class Ship {
  x = 0;
  y = 0;
  a = 0;
  r = 0;
  blinkNum = 0;
  blinkTime = 0;
  canShoot = false;
  dead = false;
  explodeTime = 0;
  rot = 0;
  thrusting = false;
  thrust = {
    x: 0,
    y: 0,
  };
  musicLibrary;
  laser;

  explode() {
    this.explodeTime = Math.ceil(Constants.SHIP_EXPLODE_DUR * Constants.FPS);
    this.musicLibrary.fxExplode.play();
  }

  constructor(musicLibrary) {
    this.musicLibrary = musicLibrary;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.a = (90 / 180) * Math.PI; // convert to radians
    this.r = Constants.SHIP_SIZE / 2;
    this.blinkNum = Math.ceil(
      Constants.SHIP_INV_DUR / Constants.SHIP_BLINK_DUR,
    );
    this.blinkTime = Math.ceil(Constants.SHIP_BLINK_DUR * Constants.FPS);
    this.canShoot = true;
    this.dead = false;
    this.explodeTime = 0;
    this.rot = 0;
    this.thrusting = false;
    this.thrust = {
      x: 0,
      y: 0,
    };
    this.laser = new Laser(this.musicLibrary, this);
  }

  drawBody(x, y, a, colour = "white") {
    ctx.strokeStyle = colour;
    ctx.lineWidth = Constants.SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
      // nose of the ship
      x + (4 / 3) * this.r * Math.cos(a),
      y - (4 / 3) * this.r * Math.sin(a),
    );
    ctx.lineTo(
      // rear left
      x - this.r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
      y + this.r * ((2 / 3) * Math.sin(a) - Math.cos(a)),
    );
    ctx.lineTo(
      // rear right
      x - this.r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
      y + this.r * ((2 / 3) * Math.sin(a) + Math.cos(a)),
    );
    ctx.closePath();
    ctx.stroke();
  }

  drawThruster(blinkOn, exploding) {
    if (this.thrusting && !this.dead) {
      this.thrust.x +=
        (Constants.SHIP_THRUST * Math.cos(this.a)) / Constants.FPS;
      this.thrust.y -=
        (Constants.SHIP_THRUST * Math.sin(this.a)) / Constants.FPS;
      this.musicLibrary.fxThrust.play();
      // draw the thruster
      if (!exploding && blinkOn) {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = Constants.SHIP_SIZE / 10;
        ctx.beginPath();
        ctx.moveTo(
          // rear left
          this.x -
            this.r * ((2 / 3) * Math.cos(this.a) + 0.5 * Math.sin(this.a)),
          this.y +
            this.r * ((2 / 3) * Math.sin(this.a) - 0.5 * Math.cos(this.a)),
        );
        ctx.lineTo(
          // rear centre (behind the ship)
          this.x - ((this.r * 5) / 3) * Math.cos(this.a),
          this.y + ((this.r * 5) / 3) * Math.sin(this.a),
        );
        ctx.lineTo(
          // rear right
          this.x -
            this.r * ((2 / 3) * Math.cos(this.a) - 0.5 * Math.sin(this.a)),
          this.y +
            this.r * ((2 / 3) * Math.sin(this.a) + 0.5 * Math.cos(this.a)),
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      return;
    }
    // apply friction (slow ship down when not thrusting)
    this.thrust.x -= (Constants.FRICTION * this.thrust.x) / Constants.FPS;
    this.thrust.y -= (Constants.FRICTION * this.thrust.y) / Constants.FPS;
    this.musicLibrary.fxThrust.stop();
  }

  draw(blinkOn, exploding) {
    if (!exploding) {
      if (blinkOn && !this.dead) {
        this.drawBody(this.x, this.y, this.a);
      }
      // handle blinking
      if (this.blinkNum > 0) {
        // reduce the blink time
        this.blinkTime -= 1;
        // reduce the blink num
        if (this.blinkTime === 0) {
          this.blinkTime = Math.ceil(Constants.SHIP_BLINK_DUR * Constants.FPS);
          this.blinkNum -= 1;
        }
      }
      return;
    }
    // draw the explosion (concentric circles of different colours)
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  drawCollisionCircle() {
    if (!Constants.SHOW_BOUNDING) {
      return;
    }
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  drawCenterDot() {
    if (!Constants.SHOW_CENTRE_DOT) {
      return;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
  }

  handleEdgeOfScreen() {
    if (this.x < 0 - this.r) {
      this.x = canvas.width + this.r;
    } else if (this.x > canvas.width + this.r) {
      this.x = 0 - this.r;
    }
    if (this.y < 0 - this.r) {
      this.y = canvas.height + this.r;
    } else if (this.y > canvas.height + this.r) {
      this.y = 0 - this.r;
    }
  }
}
