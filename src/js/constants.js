export class Constants {
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
  static SCORE_LADDER_SIZE = 10; // number of high scores to display
}
