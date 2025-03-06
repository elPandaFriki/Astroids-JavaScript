import { Constants } from "./constants.js";
import { Bullet } from "./bullet.js";
import { canvas, ctx } from "./index.js";

export class Laser {
  canShoot = true;
  bullets = [];
  ship;
  musicLibrary;

  constructor(musicLibrary, ship) {
    this.musicLibrary = musicLibrary;
    this.ship = ship;
  }

  shoot() {
    if (this.canShoot && this.bullets.length < Constants.LASER_MAX) {
      this.bullets.push(new Bullet(this.ship));
      this.musicLibrary.fxLaser.play();
    }
    // prevent further shooting
    this.canShoot = false;
  }

  draw() {
    for (let i = 0; i < this.bullets.length; i += 1) {
      if (this.bullets[i].explodeTime === 0) {
        ctx.fillStyle = "salmon";
        ctx.beginPath();
        ctx.arc(
          this.bullets[i].x,
          this.bullets[i].y,
          Constants.SHIP_SIZE / 15,
          0,
          Math.PI * 2,
          false,
        );
        ctx.fill();
        continue;
      }
      // draw the eplosion
      ctx.fillStyle = "orangered";
      ctx.beginPath();
      ctx.arc(
        this.bullets[i].x,
        this.bullets[i].y,
        this.ship.r * 0.75,
        0,
        Math.PI * 2,
        false,
      );
      ctx.fill();
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        this.bullets[i].x,
        this.bullets[i].y,
        this.ship.r * 0.5,
        0,
        Math.PI * 2,
        false,
      );
      ctx.fill();
      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(
        this.bullets[i].x,
        this.bullets[i].y,
        this.ship.r * 0.25,
        0,
        Math.PI * 2,
        false,
      );
      ctx.fill();
    }
  }

  move() {
    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      // check distance travelled
      if (this.bullets[i].dist > Constants.LASER_DIST * canvas.width) {
        this.bullets.splice(i, 1);
        continue;
      }
      // handle the explosion
      if (this.bullets[i].explodeTime > 0) {
        this.bullets[i].explodeTime -= 1;
        // destroy the laser after the duration is up
        if (this.bullets[i].explodeTime === 0) {
          this.bullets.splice(i, 1);
          continue;
        }
      } else {
        // move the laser
        this.bullets[i].x += this.bullets[i].xv;
        this.bullets[i].y += this.bullets[i].yv;
        // calculate the distance travelled
        this.bullets[i].dist += Math.sqrt(
          Math.pow(this.bullets[i].xv, 2) + Math.pow(this.bullets[i].yv, 2),
        );
      }
      // handle edge of screen
      if (this.bullets[i].x < 0) {
        this.bullets[i].x = canvas.width;
      } else if (this.bullets[i].x > canvas.width) {
        this.bullets[i].x = 0;
      }
      if (this.bullets[i].y < 0) {
        this.bullets[i].y = canvas.height;
      } else if (this.bullets[i].y > canvas.height) {
        this.bullets[i].y = 0;
      }
    }
  }
}
