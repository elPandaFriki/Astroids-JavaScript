class Constants {
  static FPS = 30; // frames per second
  static FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
  static GAME_LIVES = 3; // starting number of lives
  static LASER_DIST = 0.6; // max distance laser can travel as fraction of screen width
  static LASER_EXPLODE_DUR = 0.1; // duration of the laser' explosion in seconds
  static LASER_MAX = 10; // maximum number of laser on screen at once
  static LASER_SPD = 500; // speed of laser in pixels per second
  static ROID_JAG = 0.4; // jaggedness of the asteroids (0 = none, 1 = lots)
  static ROID_PTS_LGE = 20; // points scored for a large asteroid
  static ROID_PTS_MED = 50; // points scored for a medium asteroid
  static ROID_PTS_SML = 100; // points scored for a small asteroid
  static ROID_NUM = 1; //3; // starting number of asteroids
  static ROID_SIZE = 100; // starting size of asteroids in pixels
  static ROID_SPD = 50; // max starting speed of asteroids in pixels per second
  static ROID_VERT = 10; // average number of vertices on each asteroid
  static SAVE_KEY_SCORE = "highscore"; // save key for local storage of high score
  static SHIP_BLINK_DUR = 0.1; // duration in seconds of a single blink during ship's invisibility
  static SHIP_EXPLODE_DUR = 0.3; // duration of the ship's explosion in seconds
  static SHIP_INV_DUR = 3; // duration of the ship's invisibility in seconds
  static SHIP_SIZE = 30; // ship height in pixels
  static SHIP_THRUST = 5; // acceleration of the ship in pixels per second per second
  static SHIP_TURN_SPD = 360; // turn speed in degrees per second
  static SHOW_BOUNDING = false; // show or hide collision bounding
  static SHOW_CENTRE_DOT = false; // show or hide ship's centre dot
  static MUSIC_ON = true;
  static SOUND_ON = true;
  static TEXT_FADE_TIME = 2.5; // text fade time in seconds
  static TEXT_SIZE = 40; // text font height in pixels
}

class Ship {
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
    this.x = canv.width / 2;
    this.y = canv.height / 2;
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
      this.x = canv.width + this.r;
    } else if (this.x > canv.width + this.r) {
      this.x = 0 - this.r;
    }
    if (this.y < 0 - this.r) {
      this.y = canv.height + this.r;
    } else if (this.y > canv.height + this.r) {
      this.y = 0 - this.r;
    }
  }
}

class Bullet {
  ship;
  x = 0;
  y = 0;
  xv = 0;
  yv = 0;
  dist = 0;
  explodeTime = 0;

  constructor(ship) {
    this.ship = ship;
    // from the nose of the ship
    this.x = this.ship.x + (4 / 3) * this.ship.r * Math.cos(this.ship.a);
    this.y = this.ship.y - (4 / 3) * this.ship.r * Math.sin(this.ship.a);
    this.xv = (Constants.LASER_SPD * Math.cos(this.ship.a)) / Constants.FPS;
    this.yv = (-Constants.LASER_SPD * Math.sin(this.ship.a)) / Constants.FPS;
    this.dist = 0;
    this.explodeTime = 0;
  }
}

class Laser {
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
      if (this.bullets[i].dist > Constants.LASER_DIST * canv.width) {
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
        this.bullets[i].x = canv.width;
      } else if (this.bullets[i].x > canv.width) {
        this.bullets[i].x = 0;
      }
      if (this.bullets[i].y < 0) {
        this.bullets[i].y = canv.height;
      } else if (this.bullets[i].y > canv.height) {
        this.bullets[i].y = 0;
      }
    }
  }
}

class Asteroid {
  x = 0;
  y = 0;
  xv = 0;
  yv = 0;
  a = 0;
  r = 0;
  offs = [];
  vert = 0;
  level;

  constructor(x, y, r, level) {
    this.level = level;
    const lvlMult = 1 + 0.1 * this.level.stage;
    this.x = x;
    this.y = y;
    this.xv =
      ((Math.random() * Constants.ROID_SPD * lvlMult) / Constants.FPS) *
      (Math.random() < 0.5 ? 1 : -1);
    this.yv =
      ((Math.random() * Constants.ROID_SPD * lvlMult) / Constants.FPS) *
      (Math.random() < 0.5 ? 1 : -1);
    this.a = Math.random() * Math.PI * 2; // in radians
    this.r = r;
    this.offs = [];
    this.vert = Math.floor(
      Math.random() * (Constants.ROID_VERT + 1) + Constants.ROID_VERT / 2,
    );
    // populate the offsets array
    for (let i = 0; i < this.vert; i += 1) {
      this.offs.push(
        Math.random() * Constants.ROID_JAG * 2 + 1 - Constants.ROID_JAG,
      );
    }
  }
}

class Asteroids {
  total = 0;
  left = 0;
  belt = [];
  game;
  musicLibrary;
  ship;
  level;

  constructor(musicLibrary, ship, level, game) {
    this.game = game;
    this.ship = ship;
    this.level = level;
    this.musicLibrary = musicLibrary;
    this.belt = [];
    this.total = (Constants.ROID_NUM + this.level.stage) * 7;
    this.left = this.total;
    let x = Math.floor(Math.random() * canv.width);
    let y = Math.floor(Math.random() * canv.height);
    for (let i = 0; i < Constants.ROID_NUM + this.level.stage; i += 1) {
      // random asteroid location (not touching spaceship)
      while (
        distBetweenPoints(this.ship.x, this.ship.y, x, y) <
        Constants.ROID_SIZE * 2 + this.ship.r
      ) {
        x = Math.floor(Math.random() * canv.width);
        y = Math.floor(Math.random() * canv.height);
      }
      this.belt.push(
        new Asteroid(x, y, Math.ceil(Constants.ROID_SIZE / 2), this.level),
      );
    }
  }

  destroy(index) {
    let x = this.belt[index].x;
    let y = this.belt[index].y;
    let r = this.belt[index].r;
    // split the asteroid in two if necessary
    if (r === Math.ceil(Constants.ROID_SIZE / 2)) {
      // large asteroid
      this.belt.push(
        new Asteroid(x, y, Math.ceil(Constants.ROID_SIZE / 4), this.level),
        new Asteroid(x, y, Math.ceil(Constants.ROID_SIZE / 4), this.level),
      );
      this.game.score += Constants.ROID_PTS_LGE;
    } else if (r === Math.ceil(Constants.ROID_SIZE / 4)) {
      // medium asteroid
      this.belt.push(
        new Asteroid(x, y, Math.ceil(Constants.ROID_SIZE / 8), this.level),
        new Asteroid(x, y, Math.ceil(Constants.ROID_SIZE / 8), this.level),
      );
      this.game.score += Constants.ROID_PTS_MED;
    } else {
      this.game.score += Constants.ROID_PTS_SML;
    }
    // check high score
    if (this.game.score > this.game.scoreHigh) {
      this.game.scoreHigh = this.game.score;
      localStorage.setItem(Constants.SAVE_KEY_SCORE, this.game.scoreHigh);
    }
    // destroy the asteroid
    this.belt.splice(index, 1);
    this.musicLibrary.fxHit.play();
    // calculate the ratio of remaining asteroids to determine background music tempo
    this.left -= 1;
    this.musicLibrary.background.setAsteroidRatio(this.left / this.total);
    // new stage when no more asteroids
    if (this.belt.length > 0) {
      return;
    }
    this.level.nextStage();
  }

  move() {
    for (let i = 0; i < this.belt.length; i += 1) {
      this.belt[i].x += this.belt[i].xv;
      this.belt[i].y += this.belt[i].yv;
      // handle asteroid edge of screen
      if (this.belt[i].x < 0 - this.belt[i].r) {
        this.belt[i].x = canv.width + this.belt[i].r;
      } else if (this.belt[i].x > canv.width + this.belt[i].r) {
        this.belt[i].x = 0 - this.belt[i].r;
      }
      if (this.belt[i].y < 0 - this.belt[i].r) {
        this.belt[i].y = canv.height + this.belt[i].r;
      } else if (this.belt[i].y > canv.height + this.belt[i].r) {
        this.belt[i].y = 0 - this.belt[i].r;
      }
    }
  }

  draw() {
    for (let i = 0; i < this.belt.length; i += 1) {
      ctx.strokeStyle = "slategrey";
      ctx.lineWidth = Constants.SHIP_SIZE / 20;
      // get the asteroid properties
      const { a, r, x, y, offs, vert } = this.belt[i];
      // draw the path
      ctx.beginPath();
      ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a));
      // draw the polygon
      for (let j = 1; j < vert; j += 1) {
        ctx.lineTo(
          x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vert),
          y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vert),
        );
      }
      ctx.closePath();
      ctx.stroke();
      // show asteroid's collision circle
      if (!Constants.SHOW_BOUNDING) {
        continue;
      }
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }
}

class Level {
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
    ctx.fillRect(0, 0, canv.width, canv.height);
  }
}

class Game {
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
      ctx.fillText(this.text, canv.width / 2, canv.height * 0.75);
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
      canv.width - Constants.SHIP_SIZE / 2,
      Constants.SHIP_SIZE,
    );
  }

  drawHighScore() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = Constants.TEXT_SIZE * 0.75 + "px dejavu sans mono";
    ctx.fillText("BEST " + this.scoreHigh, canv.width / 2, Constants.SHIP_SIZE);
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

function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

class Music {
  constructor(srcLow, srcHigh) {
    this.soundLow = new Audio(srcLow);
    this.soundHigh = new Audio(srcHigh);
    this.low = true;
    this.tempo = 1.0; // seconds per beat
    this.beatTime = 0; // frames left until next beat
  }

  play() {
    if (!Constants.MUSIC_ON) {
      return;
    }
    if (this.low) {
      this.soundLow.play();
    } else {
      this.soundHigh.play();
    }
    this.low = !this.low;
  }

  setAsteroidRatio(ratio) {
    this.tempo = 1.0 - 0.75 * (1.0 - ratio);
  }

  tick() {
    if (this.beatTime === 0) {
      this.play();
      this.beatTime = Math.ceil(this.tempo * Constants.FPS);
      return;
    }
    this.beatTime -= 1;
  }
}

class Sound {
  constructor(src, maxStreams = 1, vol = 1.0) {
    this.maxStreams = maxStreams;
    this.streamNum = 0;
    this.streams = [];
    for (let i = 0; i < maxStreams; i += 1) {
      this.streams.push(new Audio(src));
      this.streams[i].volume = vol;
    }
  }

  play() {
    if (Constants.SOUND_ON) {
      this.streamNum = (this.streamNum + 1) % this.maxStreams;
      this.streams[this.streamNum].play();
    }
  }

  stop() {
    this.streams[this.streamNum].pause();
    this.streams[this.streamNum].currentTime = 0;
  }
}

class MusicLibrary {
  fxExplode = new Sound("src/sounds/explode.m4a");
  fxHit = new Sound("src/sounds/hit.m4a", 5);
  fxLaser = new Sound("src/sounds/laser.m4a", 5, 0.5);
  fxThrust = new Sound("src/sounds/thrust.m4a");

  background = new Music(
    "src/sounds/music-low.m4a",
    "src/sounds/music-high.m4a",
  );
}

/** @type {HTMLCanvasElement} */
const canv = document.getElementById("gameCanvas");
const ctx = canv.getContext("2d");
new Game();
