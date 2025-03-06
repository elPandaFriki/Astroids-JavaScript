import { Constants } from "./constants";

export class Sound {
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
