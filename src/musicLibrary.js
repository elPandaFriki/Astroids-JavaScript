import { Music } from "./music.js";
import { Sound } from "./sound.js";

export class MusicLibrary {
  fxExplode = new Sound("src/sounds/explode.m4a");
  fxHit = new Sound("src/sounds/hit.m4a", 5);
  fxLaser = new Sound("src/sounds/laser.m4a", 5, 0.5);
  fxThrust = new Sound("src/sounds/thrust.m4a");

  background = new Music(
    "src/sounds/music-low.m4a",
    "src/sounds/music-high.m4a",
  );
}
